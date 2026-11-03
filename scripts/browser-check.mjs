import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';

// Dependency-free browser QA. Run against a running Vite preview:
// node scripts/browser-check.mjs --url=http://127.0.0.1:4173/Portfolio/
// Chrome is launched in the background; reports and screenshots stay in .qa/.
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [name, ...value] = arg.replace(/^--/, '').split('=');
  return [name, value.join('=') || true];
}));
const restorationOnly = Boolean(args['restoration-only'] || args['personal-only']);
const reportFileName = args['personal-only'] ? 'personal-report.json' : args['restoration-only'] ? 'restoration-report.json' : args['featured-only'] ? 'featured-anchor-report.json' : args.debug ? 'hydration-debug-report.json' : 'browser-report.json';
const baseUrl = String(args.url || 'http://127.0.0.1:4173/Portfolio/');
const chromePath = String(args.chrome || 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const outputDir = path.resolve('.qa');
const profileDir = path.join(outputDir, `chrome-${process.pid}-${Date.now()}`);
await mkdir(profileDir, { recursive: true });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browserErrors = [];
const consoleErrors = [];
const expectedNetworkErrors = [];
let expectFormNetworkFailure = false;
let chrome;
let cdp;

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.sequence = 0;
    this.pending = new Map();
    this.listeners = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        clearTimeout(pending.timeout);
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') {
        const details = message.params.exceptionDetails;
        browserErrors.push(details.exception?.description || details.text);
      }
      if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
        const entry = message.params.entry;
        if (expectFormNetworkFailure && entry.url?.startsWith('https://formspree.io/')) expectedNetworkErrors.push(entry.text);
        else consoleErrors.push(entry.text);
      }
      if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description).join(' '));
      }
      for (const listener of this.listeners.get(message.method) || []) {
        Promise.resolve(listener(message.params)).catch((error) => browserErrors.push(error.message));
      }
    });
  }

  on(method, listener) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(listener);
    return () => this.listeners.get(method)?.delete(listener);
  }

  async send(method, params = {}) {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timed out: ${method}`));
      }, 20000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    }
    return response.result.value;
  }
}

async function connect() {
  chrome = spawn(chromePath, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox',
    '--disable-software-rasterizer', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${profileDir}`, 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  chrome.on('error', (error) => { browserErrors.push(error.message); });
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      port = (await readFile(path.join(profileDir, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
      if (port) break;
    } catch { /* Chrome writes the port after startup. */ }
    await delay(100);
  }
  if (!port) throw new Error('Chrome did not provide a debugging port.');
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  cdp = new CDP(socket);
  await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Log.enable')]);
}

async function navigate(url) {
  await cdp.send('Page.navigate', { url });
  await waitForPage();
}

async function waitForPage() {
  for (let attempt = 0; attempt < 150; attempt++) {
    const ready = await cdp.evaluate(`document.readyState === 'complete' && !!document.querySelector('h1')`);
    if (ready) {
      await cdp.evaluate('document.fonts.ready.then(() => true)');
      await delay(200);
      return;
    }
    await delay(100);
  }
  throw new Error('Page did not finish loading.');
}

async function screenshot(name, fullPage = false) {
  const response = await cdp.send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: fullPage,
    ...(fullPage ? {
      clip: await cdp.evaluate(`({ x: 0, y: 0, width: innerWidth, height: document.documentElement.scrollHeight, scale: 1 })`),
    } : {}),
  });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(response.data, 'base64'));
  console.log(`Screenshot: .qa/${name}.png`);
}

function auditContrast() {
  const parse = (value) => {
    const values = value.match(/[\d.]+/g)?.map(Number);
    return values?.length >= 3 ? [...values.slice(0, 3), values[3] ?? 1] : null;
  };
  const blend = (foreground, background) => [
    ...foreground.slice(0, 3).map((value, index) => value * foreground[3] + background[index] * (1 - foreground[3])), 1,
  ];
  const luminance = (rgb) => rgb.slice(0, 3).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const issues = [];
  const visited = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    const element = walker.currentNode.parentElement;
    if (!text || !element || visited.has(element) || element.closest('script,style,svg,[aria-hidden="true"]')) continue;
    visited.add(element);
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (!rect.width || !rect.height || rect.width <= 1 || rect.height <= 1 || style.visibility !== 'visible') continue;
    const foreground = parse(style.color);
    if (!foreground) continue;
    const layers = [];
    let node = element;
    let uncertain = false;
    while (node) {
      const layer = getComputedStyle(node);
      if (layer.backgroundImage !== 'none' || Number(layer.opacity) < 1) { uncertain = true; break; }
      const color = parse(layer.backgroundColor);
      if (color) layers.push(color);
      if (color?.[3] === 1) break;
      node = node.parentElement;
    }
    if (uncertain) continue;
    const background = layers.reverse().reduce((result, color) => blend(color, result), [255, 255, 255, 1]);
    const first = luminance(blend(foreground, background));
    const second = luminance(background);
    const contrast = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    const size = parseFloat(style.fontSize);
    const required = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5;
    if (contrast + 0.03 < required) issues.push({ text: text.slice(0, 70), contrast: Number(contrast.toFixed(2)), required, color: style.color, background: background.slice(0, 3).map(Math.round), class: element.className });
  }
  return { total: issues.length, samples: issues.slice(0, 15) };
}

const semanticsExpression = `(() => {
  const visible = (element) => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  const name = (element) => element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent.trim() || element.querySelector('img')?.alt || '';
  return {
    title: document.title,
    language: document.documentElement.lang,
    direction: document.documentElement.dir,
    theme: document.documentElement.dataset.theme || document.documentElement.className,
    viewport: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    h1: [...document.querySelectorAll('h1')].map((element) => element.textContent.trim()),
    headings: [...document.querySelectorAll('h2')].map((element) => element.textContent.trim()),
    mainCount: document.querySelectorAll('main').length,
    sectionOrder: [...document.querySelectorAll('main > section[id]')].map((element) => element.id),
    navigationTargets: [...document.querySelectorAll('.desktop-nav a[href^="#"]')].map((element) => element.hash.slice(1)),
    profilePhoto: (() => { const image = document.querySelector('#home img'); return image ? { src: image.currentSrc || image.src, alt: image.alt, loaded: image.complete && image.naturalWidth > 0 } : null; })(),
    description: document.querySelector('meta[name="description"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    unnamedControls: [...document.querySelectorAll('a,button')].filter(visible).filter((element) => !name(element)).map((element) => element.outerHTML.slice(0, 300)),
    brokenImages: [...document.images].filter((image) => image.complete && !image.naturalWidth).map((image) => image.src),
    missingTargets: [...document.querySelectorAll('a[href^="#"]')].filter((link) => !link.matches('[data-personal-toggle],[data-personal-back]') && link.hash.length > 1 && !document.getElementById(decodeURIComponent(link.hash.slice(1)))).map((link) => link.hash),
    overflowElements: [...document.querySelectorAll('body *')].filter(visible).filter((element) => {
      const rect = element.getBoundingClientRect();
      return (rect.right > innerWidth + 1 || rect.left < -1) && getComputedStyle(element).position !== 'fixed';
    }).slice(0, 8).map((element) => ({tag: element.tagName, class: element.className, text: element.textContent.trim().slice(0, 80)})),
    controls: [...document.querySelectorAll('button')].filter(visible).map((element) => ({ name: name(element), expanded: element.getAttribute('aria-expanded'), pressed: element.getAttribute('aria-pressed') })),
  };
})()`;

async function clickByName(pattern, tag = 'button') {
  return cdp.evaluate(`(() => {
    const matcher = new RegExp(${JSON.stringify(pattern)}, 'i');
    const element = [...document.querySelectorAll(${JSON.stringify(tag)})].find((item) => matcher.test(item.getAttribute('aria-label') || item.textContent.trim()));
    if (!element) return false;
    element.focus({preventScroll: true});
    element.click();
    return true;
  })()`);
}

async function clickSelector(selector) {
  return cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.focus({preventScroll: true}); element.click(); return true; })()`);
}

async function pressKey(key, code = key, virtualKey = 0, modifiers = 0) {
  const textInput = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKey, modifiers, ...(textInput !== undefined ? { text: textInput, unmodifiedText: textInput } : {}) });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKey, modifiers });
}

async function physicalClick(selector) {
  const point = await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return null; element.scrollIntoView({block:'center',behavior:'instant'}); const rect=element.getBoundingClientRect(); return {x:rect.x+rect.width/2,y:rect.y+rect.height/2}; })()`);
  if (!point) return false;
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  await delay(150);
  return true;
}

async function waitFor(expression, description, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (await cdp.evaluate(expression)) return;
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

function localizedUrl(language, hash = '') {
  const url = new URL(baseUrl);
  if (language === 'ar') url.pathname = `${url.pathname.replace(/\/$/, '')}/ar/`;
  url.hash = hash;
  return url.href;
}

async function checkPersonalSpace() {
  const cases = [];
  await navigate(localizedUrl('en'));
  for (const width of [1440, 390]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: width === 1440 ? 1000 : 844, deviceScaleFactor: 1, mobile: width < 600 });
    for (const language of ['en', 'ar']) {
      for (const theme of ['light', 'dark']) {
        await cdp.evaluate(`localStorage.setItem('theme', ${JSON.stringify(theme)})`);
        await navigate(localizedUrl(language));
        const initialName = await cdp.evaluate(`document.querySelector('[data-personal-toggle] .name-switch')?.textContent.trim()`);
        const opened = await clickSelector('[data-personal-toggle]');
        await delay(100);
        const personal = await cdp.evaluate(`({hash:location.hash, personal:!!document.getElementById('personal'), portfolioHidden:!document.getElementById('home'), name:document.querySelector('[data-personal-toggle] .name-switch')?.textContent.trim(), languageHref:document.querySelector('[data-language-switch]')?.href, focus:document.activeElement?.tagName})`);
        const semantics = await cdp.evaluate(semanticsExpression);
        const contrast = await cdp.evaluate(`(${auditContrast.toString()})()`);
        await screenshot(`personal-${width}-${language}-${theme}`);
        const backClicked = await clickSelector('[data-personal-back]');
        await delay(100);
        const back = await cdp.evaluate(`({home:!!document.getElementById('home'),personalHidden:!document.getElementById('personal'),name:document.querySelector('[data-personal-toggle] .name-switch')?.textContent.trim(),hash:location.hash})`);
        await navigate(localizedUrl(language, 'personal'));
        const directHash = await cdp.evaluate(`!!document.getElementById('personal') && !document.getElementById('home')`);
        const brandReturned = await clickSelector('[data-personal-toggle]');
        await delay(100);
        const brandBack = await cdp.evaluate(`!!document.getElementById('home') && !document.getElementById('personal') && location.hash !== '#personal'`);
        await navigate(localizedUrl(language, 'personal'));
        const languageClicked = await clickSelector('[data-language-switch]');
        await waitFor(`document.documentElement.lang !== ${JSON.stringify(language)}`, 'personal language navigation');
        await waitForPage();
        const languageSwitch = await cdp.evaluate(`({language:document.documentElement.lang,direction:document.documentElement.dir,theme:document.documentElement.dataset.theme,personal:!!document.getElementById('personal'),hash:location.hash})`);
        cases.push({ width, language, theme, initialName, opened, personal, semantics, contrast, backClicked, back, directHash, brandReturned, brandBack, languageClicked, languageSwitch });
      }
    }
  }
  return cases;
}

async function checkAutoScroll() {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  const results = [];
  for (const method of ['wheel', 'touch', 'keyboard', 'toggle']) {
    await navigate(localizedUrl('en'));
    await cdp.evaluate(`scrollTo({top:0,behavior:'instant'})`);
    const clicked = await clickSelector('[data-scroll-explore]');
    await delay(350);
    const running = await cdp.evaluate(`({pressed:document.querySelector('[data-scroll-explore]')?.getAttribute('aria-pressed'),scrollY})`);
    if (method === 'wheel') {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 500, deltaX: 0, deltaY: 120 });
    } else if (method === 'touch') {
      // Dispatch the cancellation gesture without introducing inertial browser scrolling.
      await cdp.evaluate(`window.dispatchEvent(new Event('touchmove'))`);
    } else if (method === 'keyboard') {
      await pressKey('Escape', 'Escape', 27);
    } else await clickSelector('[data-scroll-explore]');
    await delay(250);
    const stopped = await cdp.evaluate(`({pressed:document.querySelector('[data-scroll-explore]')?.getAttribute('aria-pressed'),scrollY})`);
    await delay(250);
    const settled = await cdp.evaluate('scrollY');
    results.push({ method, clicked, running, stopped, settled, continuedAfterCancel: Math.abs(settled - stopped.scrollY) > 2 });
  }
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await navigate(localizedUrl('en'));
  await clickSelector('[data-scroll-explore]');
  await delay(150);
  const reduced = await cdp.evaluate(`({pressed:document.querySelector('[data-scroll-explore]')?.getAttribute('aria-pressed'),scrollY,aboutTop:document.getElementById('about')?.getBoundingClientRect().top})`);
  await delay(250);
  reduced.settled = await cdp.evaluate('scrollY');
  return { cases: results, reduced };
}

async function checkNavigation() {
  const cases = [];
  for (const width of [1440, 390]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: width === 1440 ? 1000 : 844, deviceScaleFactor: 1, mobile: width < 600 });
    for (const language of ['en', 'ar']) {
      await navigate(localizedUrl(language));
      for (const id of ['about', 'experience', 'projects', 'skills', 'education', 'contact', 'home']) {
        if (width < 600) await physicalClick('[data-menu-toggle]');
        const clicked = await physicalClick(`${width < 600 ? '.mobile-nav' : '.desktop-nav'} a[href="#${id}"]`);
        await delay(100);
        const position = await cdp.evaluate(`(() => {const target=document.getElementById(${JSON.stringify(id)}),rect=target?.getBoundingClientRect();return {hash:location.hash,targetTop:rect?.top,targetBottom:rect?.bottom,headerBottom:document.querySelector('header').getBoundingClientRect().bottom,menuClosed:document.querySelector('[data-menu-toggle]')?.getAttribute('aria-expanded')!=='true'};})()`);
        cases.push({ width, language, id, clicked, ...position });
      }
    }
  }
  return cases;
}

async function checkContactForm() {
  const requests = [];
  const cases = [];
  const pausedRequests = new Set();
  let pendingRequest;
  const fulfill = async (requestId, responseCode, body) => { await cdp.send('Fetch.fulfillRequest', {
    requestId, responseCode,
    responseHeaders: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Access-Control-Allow-Origin', value: '*' },
      { name: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
      { name: 'Access-Control-Allow-Headers', value: 'Content-Type, Accept' },
    ],
    body: Buffer.from(JSON.stringify(body)).toString('base64'),
  }); pausedRequests.delete(requestId); };
  const removeListener = cdp.on('Fetch.requestPaused', async (event) => {
    pausedRequests.add(event.requestId);
    if (event.request.method === 'OPTIONS') await fulfill(event.requestId, 204, {});
    else {
      requests.push({ url: event.request.url, method: event.request.method, payload: event.request.postData });
      pendingRequest = event;
    }
  });
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: 'https://formspree.io/*', requestStage: 'Request' }] });
  try {
    for (const language of ['en', 'ar']) {
      await navigate(localizedUrl(language));
      const fields = await cdp.evaluate(`(() => {const form=document.getElementById('contact-form');return {exists:!!form,action:form?.action,method:form?.method,fields:form?[...form.querySelectorAll('input:not([type="hidden"]),textarea')].map(e=>({name:e.name,required:e.required,label:!!document.querySelector('label[for="'+e.id+'"]')})):[]};})()`);
      const beforeInvalid = requests.length;
      await cdp.evaluate(`document.getElementById('contact-form')?.requestSubmit()`);
      await delay(100);
      const invalidBlocked = requests.length === beforeInvalid;
      for (const result of ['success', 'service-error', 'network-error']) {
        pendingRequest = null;
        await cdp.evaluate(`(() => {const values={name:'QA Portfolio Visitor',email:'qa@example.com',subject:'Mocked browser QA',message:'This request is intercepted in the browser and never reaches Formspree.'};const form=document.getElementById('contact-form');for(const [name,value] of Object.entries(values)){const field=form.elements.namedItem(name);const setter=Object.getOwnPropertyDescriptor(field.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set;setter.call(field,value);field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));}form.requestSubmit();})()`);
        for (let attempt = 0; attempt < 100 && !pendingRequest; attempt++) await delay(50);
        if (!pendingRequest) throw new Error(`Contact form did not issue its mocked ${language} ${result} request.`);
        const pending = await cdp.evaluate(`({busy:document.getElementById('contact-form')?.getAttribute('aria-busy'),disabled:document.querySelector('#contact-form [type="submit"]')?.disabled})`);
        const countBeforeDuplicate = requests.length;
        await cdp.evaluate(`document.getElementById('contact-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
        await delay(60);
        const duplicateBlocked = requests.length === countBeforeDuplicate;
        // Both 422 and simulated network failures produce expected browser network logs.
        expectFormNetworkFailure = result !== 'success';
        if (result === 'network-error') {
          await cdp.send('Fetch.failRequest', { requestId: pendingRequest.requestId, errorReason: 'ConnectionReset' });
          pausedRequests.delete(pendingRequest.requestId);
        }
        else await fulfill(pendingRequest.requestId, result === 'success' ? 200 : 422, result === 'success' ? { ok: true } : { errors: [{ message: 'QA service error' }] });
        for (const requestId of [...pausedRequests]) await fulfill(requestId, 422, { errors: [{ message: 'Duplicate intercepted QA request' }] });
        await waitFor(`document.querySelector('#contact-form [type="submit"]')?.disabled === false && !!document.querySelector('[data-contact-status]')?.textContent.trim()`, 'contact result');
        const outcome = await cdp.evaluate(`(() => {const form=document.getElementById('contact-form'),status=document.querySelector('[data-contact-status]');return {busy:form.getAttribute('aria-busy'),disabled:form.querySelector('[type="submit"]').disabled,status:status?.dataset.status,message:status?.textContent.trim(),role:status?.getAttribute('role'),values:['name','email','subject','message'].map(name=>form.elements.namedItem(name).value)};})()`);
        const contrast = await cdp.evaluate(`(${auditContrast.toString()})()`);
        const payload = requests.at(-1);
        cases.push({ language, result, fields, invalidBlocked, pending, duplicateBlocked, outcome, contrast, request: payload });
        if (result === 'service-error') {
          await cdp.evaluate(`document.getElementById('contact').scrollIntoView({behavior:'instant',block:'start'})`);
          await screenshot(`contact-${language}-error`);
        }
        expectFormNetworkFailure = false;
      }
    }
  } finally {
    // Abort every paused request before disabling interception, even after failed assertions.
    // This prevents any test submission from reaching the real Formspree endpoint.
    for (const requestId of pausedRequests) await cdp.send('Fetch.failRequest', { requestId, errorReason: 'Aborted' });
    await cdp.send('Fetch.disable');
    removeListener();
    expectFormNetworkFailure = false;
  }
  return { intercepted: requests.length, externalSubmissions: 0, cases, expectedNetworkErrors };
}

async function checkResume() {
  const hrefs = await cdp.evaluate(`Array.from(document.querySelectorAll('a[download]'),e=>e.href)`);
  const unique = [...new Set(hrefs)];
  const expected = await readFile(path.resolve('public/Mohamad Moallem_CV_2026.pdf'));
  const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const downloads = [];
  for (const url of unique) {
    const response = await fetch(url);
    const bytes = Buffer.from(await response.arrayBuffer());
    downloads.push({url,status:response.status,pdf:bytes.subarray(0,5).toString() === '%PDF-',sha256:hash(bytes),matchesPublicAsset:hash(bytes) === hash(expected)});
  }
  const sourceHash = args.cv ? hash(await readFile(String(args.cv))) : undefined;
  return {links:hrefs.length,publicSha256:hash(expected),sourceSha256:sourceHash,matchesProvidedCv:sourceHash?sourceHash===hash(expected):undefined,downloads};
}

const report = { url: baseUrl, cases: [], responsiveCases: [], interactions: {}, browserErrors, consoleErrors };
try {
  await connect();
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  if (args['featured-only']) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width:390, height:844, deviceScaleFactor:1, mobile:true });
    report.featuredCases = [];
    for (const language of ['en', 'ar']) {
      const localeUrl = new URL(baseUrl);
      if (language === 'ar') localeUrl.pathname = `${localeUrl.pathname.replace(/\/$/, '')}/ar/`;
      await navigate(localeUrl.href);
      await physicalClick('[data-project-filter="web"]');
      const webFilterSelected = await cdp.evaluate(`document.querySelector('[data-project-filter="web"]')?.getAttribute('aria-pressed') === 'true' && !document.getElementById('project-safewalk')`);
      await physicalClick('.feature-art-link');
      const result = await cdp.evaluate(`(() => {const target=document.getElementById('project-safewalk');const rect=target?.getBoundingClientRect();return {allFilterSelected:document.querySelector('[data-project-filter="all"]')?.getAttribute('aria-pressed') === 'true',targetExists:!!target,targetVisible:!!rect&&rect.top>=document.querySelector('header').getBoundingClientRect().height&&rect.top<innerHeight,targetTop:rect?.top,hash:location.hash,language:document.documentElement.lang};})()`);
      report.featuredCases.push({expectedLanguage:language,webFilterSelected,...result});
    }
  } else if (args.debug) {
    await navigate(baseUrl);
    await delay(500);
    await screenshot('hydration-debug');
  } else {
  if (!restorationOnly) {
  for (const width of [1440, 390]) {
    const height = width === 1440 ? 1000 : 844;
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    for (const language of ['en', 'ar']) {
      const localeUrl = new URL(baseUrl);
      if (language === 'ar') localeUrl.pathname = `${localeUrl.pathname.replace(/\/$/, '')}/ar/`;
      for (const theme of ['light', 'dark']) {
        const errorCountBefore = browserErrors.length;
        const consoleCountBefore = consoleErrors.length;
        await cdp.send('Emulation.setEmulatedMedia', { features: [
          { name: 'prefers-reduced-motion', value: 'reduce' },
          { name: 'prefers-color-scheme', value: theme },
        ] });
        await navigate(localeUrl.href);
        await cdp.evaluate(`localStorage.setItem('theme', ${JSON.stringify(theme)});`);
        await cdp.send('Page.reload');
        await delay(100);
        await waitForPage();
        const name = `${width}-${language}-${theme}`;
        const result = await cdp.evaluate(semanticsExpression);
        const contrast = await cdp.evaluate(`(${auditContrast.toString()})()`);
        report.cases.push({ name, localeCorrect: result.language === language && result.direction === (language === 'ar' ? 'rtl' : 'ltr'), themeCorrect: result.theme === theme, browserErrorCount: browserErrors.length - errorCountBefore, consoleErrorCount: consoleErrors.length - consoleCountBefore, ...result, contrast });
        await screenshot(name);
        if (width === 1440 && language === 'en' && theme === 'light') await screenshot(`${name}-full`, true);
      }
    }
  }
  report.interactions.availableButtons = await cdp.evaluate(`Array.from(document.querySelectorAll('button'), element => ({text: element.textContent.trim(), label: element.getAttribute('aria-label')}))`);
  const themeBefore = await cdp.evaluate('document.documentElement.dataset.theme');
  report.interactions.themeControlPresent = await clickSelector('[data-theme-toggle]');
  await delay(150);
  report.interactions.themeToggled = await cdp.evaluate(`document.documentElement.dataset.theme !== ${JSON.stringify(themeBefore)}`);
  await clickSelector('[data-theme-toggle]');
  report.interactions.languageLink = await cdp.evaluate(`document.querySelector('[data-language-switch]')?.href`);
  if (await clickSelector('[data-menu-toggle]') || await clickByName('menu|القائمة')) {
    await delay(150);
    report.interactions.mobileMenuOpen = await cdp.evaluate(semanticsExpression);
    await screenshot('390-ar-dark-menu');
    await pressKey('Escape', 'Escape', 27);
    report.interactions.mobileMenuAfterEscape = await cdp.evaluate(`Array.from(document.querySelectorAll('[aria-expanded]'), element => ({name: element.getAttribute('aria-label') || element.textContent.trim(), expanded: element.getAttribute('aria-expanded')}))`);
  }
  report.interactions.filters = [];
  for (const filter of ['vision', 'nlp', 'web', 'data', 'all']) {
    if (await clickSelector(`[data-project-filter="${filter}"]`)) {
      await delay(100);
      report.interactions.filters.push(await cdp.evaluate(`({filter: ${JSON.stringify(filter)}, buttons: Array.from(document.querySelectorAll('[data-project-filter]'), element => ({filter: element.dataset.projectFilter, pressed: element.getAttribute('aria-pressed')})), projectCount: document.querySelectorAll('[data-project-details]').length})`));
    }
  }
  await clickSelector('[data-project-filter="web"]');
  await delay(100);
  if (await clickSelector('.feature-art-link')) {
    await delay(250);
    report.interactions.featuredAnchorAfterFilter = await cdp.evaluate(`(() => { const target = document.getElementById('project-safewalk'); const rect = target?.getBoundingClientRect(); return {allFilterSelected:document.querySelector('[data-project-filter="all"]')?.getAttribute('aria-pressed') === 'true', targetExists:!!target, targetVisible:!!rect && rect.top >= 0 && rect.top < innerHeight, targetTop:rect?.top, hash:location.hash}; })()`);
  } else {
    await clickSelector('[data-project-filter="all"]');
  }
  if (await clickSelector('[data-project-details]') || await clickByName('details|case study|التفاصيل|المشروع')) {
    await delay(150);
    report.interactions.dialogOpen = await cdp.evaluate(`(() => { const element = document.querySelector('dialog[open],[role="dialog"]:not(dialog)'); return {open: !!element, title: element?.getAttribute('aria-labelledby'), focusedElement: document.activeElement?.outerHTML.slice(0,200), text: element?.textContent.slice(0,500)}; })()`);
    await screenshot('390-ar-dark-project');
    await pressKey('Tab', 'Tab', 9, 8);
    report.interactions.dialogFocusTrapped = await cdp.evaluate(`!!document.activeElement?.closest('dialog[open],[role="dialog"]:not(dialog)')`);
    await pressKey('Escape', 'Escape', 27);
    report.interactions.dialogClosedByEscape = await cdp.evaluate(`!document.querySelector('dialog[open],[role="dialog"]:not(dialog)')`);
    report.interactions.dialogFocusRestored = await cdp.evaluate(`!!document.activeElement?.matches('[data-project-details]')`);
    await clickSelector('[data-project-details]');
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 4, y: 4, button: 'left', clickCount: 1 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 4, y: 4, button: 'left', clickCount: 1 });
    await delay(100);
    report.interactions.dialogClosedByBackdrop = await cdp.evaluate(`!document.querySelector('dialog[open],[role="dialog"]:not(dialog)')`);
    report.interactions.dialogBackdropFocusRestored = await cdp.evaluate(`!!document.activeElement?.matches('[data-project-details]')`);
  }
  await cdp.evaluate(`Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async(text)=>{window.__qaCopiedEmail=text;}}});`);
  await clickSelector('[data-copy-email]');
  await delay(100);
  report.interactions.copyEmail = await cdp.evaluate(`({value:window.__qaCopiedEmail, announced:document.querySelector('.copy-status')?.textContent.trim(), accessibleLabel:document.querySelector('[data-copy-email]')?.getAttribute('aria-label')})`);
  await cdp.evaluate(`navigator.clipboard.writeText=async()=>{throw new DOMException('Clipboard denied for QA', 'NotAllowedError');};`);
  await clickSelector('[data-copy-email]');
  await delay(100);
  report.interactions.copyEmailError = await cdp.evaluate(`document.querySelector('.copy-status')?.textContent.trim()`);
  await cdp.send('Page.reload');
  await delay(100);
  await waitForPage();
  report.interactions.themePersistedAfterReload = await cdp.evaluate(`document.documentElement.dataset.theme === 'dark' && localStorage.getItem('theme') === 'dark'`);
  const languageHref = await cdp.evaluate(`document.querySelector('[data-language-switch]')?.href`);
  if (languageHref) {
    await navigate(languageHref);
    report.interactions.languageLinkNavigated = await cdp.evaluate(`({url:location.href, language:document.documentElement.lang, direction:document.documentElement.dir, theme:document.documentElement.dataset.theme})`);
  }
  const expectedCounts = { vision: 2, nlp: 1, web: 1, data: 1, all: 5 };
  report.interactionFailures = [
    ...['themeControlPresent', 'themeToggled', 'themePersistedAfterReload', 'dialogFocusTrapped', 'dialogClosedByEscape', 'dialogFocusRestored', 'dialogClosedByBackdrop', 'dialogBackdropFocusRestored'].filter((key) => report.interactions[key] !== true),
    ...report.interactions.filters.filter((item) => item.projectCount !== expectedCounts[item.filter] || !item.buttons.every((button) => button.pressed === String(button.filter === item.filter))).map((item) => `filter-${item.filter}`),
    ...(report.interactions.filters.length === 5 ? [] : ['missing-filters']),
    ...(report.interactions.mobileMenuAfterEscape?.every((item) => item.expanded === 'false') ? [] : ['menu-escape']),
    ...(report.interactions.dialogOpen?.open ? [] : ['dialog-open']),
    ...(report.interactions.copyEmail?.value && report.interactions.copyEmail?.announced && report.interactions.copyEmailError ? [] : ['copy-email']),
    ...(report.interactions.languageLinkNavigated?.language === 'en' && report.interactions.languageLinkNavigated?.direction === 'ltr' ? [] : ['language-link']),
    ...(!report.interactions.featuredAnchorAfterFilter || (report.interactions.featuredAnchorAfterFilter.allFilterSelected && report.interactions.featuredAnchorAfterFilter.targetExists && report.interactions.featuredAnchorAfterFilter.targetVisible) ? [] : ['featured-anchor-after-filter']),
  ];
  for (const width of [320, 768, 1024]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    for (const language of ['en', 'ar']) {
      const localeUrl = new URL(baseUrl);
      if (language === 'ar') localeUrl.pathname = `${localeUrl.pathname.replace(/\/$/, '')}/ar/`;
      await navigate(localeUrl.href);
      report.responsiveCases.push({width, language, ...await cdp.evaluate(semanticsExpression)});
    }
  }
  report.resume = await checkResume();
  }
  report.personalCases = await checkPersonalSpace();
  if (!args['personal-only']) {
    report.navigationCases = await checkNavigation();
    report.autoScroll = await checkAutoScroll();
  }
  if (!restorationOnly) report.contact = await checkContactForm();
  const order = ['home', 'about', 'experience', 'projects', 'skills', 'education', 'contact'];
  report.restorationFailures = [
    ...report.cases.filter((item) => JSON.stringify(item.sectionOrder) !== JSON.stringify(order) || JSON.stringify(item.navigationTargets) !== JSON.stringify(order) || !item.profilePhoto?.loaded || !item.profilePhoto?.alt).map((item) => `original-flow-${item.name}`),
    ...report.personalCases.filter((item) => !item.opened || item.personal.hash !== '#personal' || !item.personal.personal || !item.personal.portfolioHidden || item.initialName !== (item.language === 'en' ? 'Mohamad' : 'محمد') || item.personal.name !== (item.language === 'en' ? 'Moallem' : 'معلم') || item.back.name !== item.initialName || !item.backClicked || !item.back.home || !item.back.personalHidden || !item.directHash || !item.brandReturned || !item.brandBack || !item.languageClicked || item.languageSwitch.language === item.language || item.languageSwitch.direction !== (item.language === 'en' ? 'rtl' : 'ltr') || item.languageSwitch.theme !== item.theme || !item.languageSwitch.personal || item.languageSwitch.hash !== '#personal' || item.semantics.h1.length !== 1 || item.semantics.mainCount !== 1 || item.semantics.horizontalOverflow || item.semantics.unnamedControls.length || item.semantics.brokenImages.length || item.semantics.missingTargets.length || item.contrast.total).map((item) => `personal-${item.width}-${item.language}-${item.theme}`),
    ...(report.navigationCases || []).filter((item) => !item.clicked || item.hash !== `#${item.id}` || !item.menuClosed || item.targetTop < item.headerBottom - 2 || item.targetTop > item.headerBottom + 120).map((item) => `navigation-${item.width}-${item.language}-${item.id}`),
    ...(report.autoScroll?.cases || []).filter((item) => !item.clicked || item.running.pressed !== 'true' || item.running.scrollY <= 0 || item.stopped.pressed !== 'false' || item.continuedAfterCancel).map((item) => `scroll-${item.method}`),
    ...(!report.autoScroll || (report.autoScroll.reduced.pressed !== 'true' && Math.abs(report.autoScroll.reduced.scrollY - report.autoScroll.reduced.settled) <= 2 && Math.abs(report.autoScroll.reduced.aboutTop) < 200) ? [] : ['scroll-reduced-motion']),
    ...(report.contact?.cases || []).filter((item) => !item.fields.exists || item.fields.action !== 'https://formspree.io/f/mjgblvkr' || item.fields.method !== 'post' || item.fields.fields.length !== 4 || item.fields.fields.some((field) => !field.required || !field.label) || !item.invalidBlocked || !item.duplicateBlocked || item.pending.busy !== 'true' || !item.pending.disabled || item.outcome.disabled || item.outcome.busy !== 'false' || !item.outcome.message || item.outcome.role !== 'status' || item.outcome.status !== (item.result === 'success' ? 'success' : 'error') || (item.result === 'success' ? item.outcome.values.some(Boolean) : item.outcome.values.some((value) => !value)) || item.request.method !== 'POST' || !item.request.payload?.includes('qa@example.com') || item.contrast.total).map((item) => `contact-${item.language}-${item.result}`),
    ...(!report.resume || (report.resume.links >= 2 && report.resume.downloads.length === 1 && report.resume.downloads.every((item) => item.status === 200 && item.pdf && item.matchesPublicAsset) && report.resume.matchesProvidedCv !== false) ? [] : ['resume-asset']),
  ];
  }
  await writeFile(path.join(outputDir, reportFileName), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(args.verbose ? report : {
    url: report.url,
    cases: report.cases.map((item) => ({name: item.name, localeCorrect: item.localeCorrect, themeCorrect: item.themeCorrect, horizontalOverflow: item.horizontalOverflow, h1Count: item.h1.length, mainCount: item.mainCount, unnamedControls: item.unnamedControls.length, brokenImages: item.brokenImages.length, missingTargets: item.missingTargets.length, contrastIssues: item.contrast.total, browserErrorCount: item.browserErrorCount, consoleErrorCount: item.consoleErrorCount})),
    interactions: { ...report.interactions, availableButtons: undefined, mobileMenuOpen: report.interactions.mobileMenuOpen ? {horizontalOverflow: report.interactions.mobileMenuOpen.horizontalOverflow} : null },
    interactionFailures: report.interactionFailures,
    restorationFailures: report.restorationFailures,
    personalCases: report.personalCases?.map((item) => ({width:item.width,language:item.language,theme:item.theme,opened:item.opened,initialName:item.initialName,personalName:item.personal.name,directHash:item.directHash,back:item.back.home,brandBack:item.brandBack,horizontalOverflow:item.semantics.horizontalOverflow,contrastIssues:item.contrast.total})),
    autoScroll: report.autoScroll,
    contact: report.contact ? {intercepted:report.contact.intercepted,externalSubmissions:report.contact.externalSubmissions,cases:report.contact.cases.map((item)=>({language:item.language,result:item.result,invalidBlocked:item.invalidBlocked,duplicateBlocked:item.duplicateBlocked,pending:item.pending,outcome:item.outcome}))} : undefined,
    resume: report.resume,
    responsiveCases: report.responsiveCases.map((item) => ({width:item.width, language:item.language, horizontalOverflow:item.horizontalOverflow, overflowElements:item.horizontalOverflow?item.overflowElements:undefined})),
    featuredCases: report.featuredCases,
    browserErrors: { count: browserErrors.length, unique: [...new Set(browserErrors.map((error) => error.split('\n')[0]))] },
    consoleErrors: { count: consoleErrors.length, unique: [...new Set(consoleErrors)] },
  }, null, 2));
  if (browserErrors.length || consoleErrors.length || report.interactionFailures?.length || report.restorationFailures?.length || report.featuredCases?.some((result) => !result.webFilterSelected || !result.allFilterSelected || !result.targetVisible || result.language !== result.expectedLanguage) || report.responsiveCases.some((result) => result.horizontalOverflow) || report.cases.some((result) => !result.localeCorrect || !result.themeCorrect || result.horizontalOverflow || result.h1.length !== 1 || result.mainCount !== 1 || result.unnamedControls.length || result.brokenImages.length || result.missingTargets.length || result.contrast.total)) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error);
  report.failure = error.message;
  await writeFile(path.join(outputDir, reportFileName), JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  try { await cdp?.send('Browser.close'); } catch { /* Chrome may already have exited. */ }
  cdp?.socket.close();
  chrome?.kill();
  await delay(300);
  // Verify the resolved deletion target is one of our own temporary profiles.
  if (path.dirname(profileDir) === outputDir && path.basename(profileDir).startsWith('chrome-')) {
    try { await rm(profileDir, { recursive: true, force: true }); } catch { /* Windows can briefly retain Chrome handles. */ }
  }
}
