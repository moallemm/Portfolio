import { useId } from 'react';

export function SafeWalkScene({ isArabic = false }) {
  const id = useId().replaceAll(':', '');
  return <svg className="safewalk-scene" viewBox="0 0 560 380" fill="none" direction="ltr" aria-hidden="true">
    <defs><pattern id={`grid-${id}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" stroke="currentColor" strokeOpacity=".06" /></pattern></defs>
    <rect width="560" height="380" fill={`url(#grid-${id})`} /><circle cx="440" cy="92" r="37" fill="var(--scene-sun)" />
    <path d="M0 263 162 241 257 234 343 239 560 273V380H0Z" fill="var(--scene-road)" /><path d="m260 234-39 146m85-143 66 143" stroke="var(--scene-line)" strokeOpacity=".35" />
    <path d="M0 115 91 141v125L0 282ZM91 141l62-36v146l-62 15Z" fill="var(--scene-building)" stroke="var(--scene-line)" strokeWidth="1.5" /><path d="m20 148 49 14m-49 18 49 12m-49 17 49 10m41-70 25-13m-25 45 25-12m-25 44 25-11" stroke="var(--scene-line)" strokeOpacity=".5" strokeWidth="2" />
    <path d="m385 135 87-32 88 26v154l-88-18-87-18Z" fill="var(--scene-building)" stroke="var(--scene-line)" strokeWidth="1.5" /><path d="M472 105v158m-67-111 45-17m-45 47 45-15m-45 46 45-13m39-61 51 15m-51 18 51 13m-51 19 51 12" stroke="var(--scene-line)" strokeOpacity=".5" strokeWidth="2" />
    <path d="m192 311 16-17h150l20 17Zm-21 26 15-17h201l21 17Zm-27 32 16-20h262l23 20Z" fill="var(--scene-crossing)" />
    <path d="M177 194v67m-20 0h40" stroke="var(--scene-line)" strokeWidth="3" strokeLinecap="round" /><circle cx="177" cy="183" r="25" fill="var(--scene-leaf)" /><circle cx="166" cy="165" r="21" fill="var(--scene-leaf)" /><circle cx="188" cy="162" r="23" fill="var(--scene-leaf)" /><path d="M177 164v47m0-27-11-8m11 17 12-11" stroke="var(--scene-line)" strokeOpacity=".5" strokeLinecap="round" />
    <ellipse cx="293" cy="285" rx="26" ry="7" fill="var(--scene-line)" opacity=".14" /><circle cx="291" cy="178" r="12" fill="var(--scene-person)" /><path d="m283 196-8 43 17 1 14-7-10-38Z" fill="var(--scene-person)" /><path d="m284 238-8 42m17-41 17 40m-32-75-17 22m39-22 13 22 14 7" stroke="var(--scene-person)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="m327 233 18 51" stroke="var(--scene-person)" strokeWidth="3" strokeLinecap="round" />
    <path d="M257 158h70v132h-70Z" stroke="var(--scene-detection)" strokeWidth="1.5" strokeDasharray="5 4" /><path d="M257 169v-11h11m48 0h11v11m0 110v11h-11m-48 0h-11v-11" stroke="var(--scene-detection)" strokeWidth="3" /><rect x="257" y="138" width="70" height="20" rx="3" fill="var(--scene-detection)" /><text x="292" y="152" textAnchor="middle" fill="var(--scene-label)" fontSize="10" fontFamily="sans-serif">{isArabic ? 'شخص' : 'PERSON'}</text><path d="M202 292h159v21H202Z" stroke="var(--scene-detection)" strokeWidth="1.5" strokeDasharray="5 4" />
    <circle cx="39" cy="35" r="4" fill="var(--scene-detection)" /><text x="52" y="39" fill="var(--scene-line)" fontSize="10" fontFamily="monospace" letterSpacing="1.2">SAFEWALK / VISION STUDY</text><path d="M25 69V56h13m497 13V56h-13M25 330v13h13m497-13v13h-13" stroke="var(--scene-line)" strokeOpacity=".4" />
  </svg>;
}

export default function ProjectVisual({ type, isArabic }) {
  if (type === 'safewalk') return <SafeWalkScene isArabic={isArabic} />;
  if (type === 'portfolio') return (
    <div className="portfolio-art" aria-hidden="true">
      <div className="portfolio-mini">
        <div className="portfolio-mini-header"><span>m.</span><i /><i /><i /></div>
        <div className="portfolio-mini-hero">
          <img src={`${import.meta.env.BASE_URL}profile.jpg`} alt="" width="500" height="350" loading="lazy" />
          <div><strong>{isArabic ? 'محمد معلم.' : 'Mohamad Moallem.'}</strong><p>{isArabic ? 'علم البيانات وتطوير البرمجيات' : 'Data science & software'}</p><span>{isArabic ? 'تواصل معي' : 'Get in touch'} ↗</span></div>
        </div>
        <div className="portfolio-mini-projects"><i /><i /><i /></div>
      </div>
    </div>
  );
  if (type === 'bert') return <div className="bert-art" aria-hidden="true"><div className="token-line"><span>The</span><span>next</span><span>word</span><span className="token-empty">▍</span></div><div className="token-connectors"><i /><i /><i /></div><div className="model-block">BERT<span>TRANSFORMER</span></div><div className="prediction"><span>{isArabic ? 'توقع' : 'predict'}</span><i /><i /><i /></div></div>;
  if (type === 'diy') return <div className="diy-art" aria-hidden="true"><div className="browser-dots"><i /><i /><i /><span>localhost / projects</span></div><div className="diy-browser"><div className="diy-browser-nav"><span>make<span className="accent-dot">.</span></span><i /><i /></div><div className="diy-browser-title">{isArabic ? 'فكرتك التالية تبدأ هنا.' : 'A little inspiration.\nA lot of possibility.'}</div><div className="diy-tiles"><div><span>↗</span><i /></div><div><span>✳</span><i /></div><div><span>⌁</span><i /></div></div></div></div>;
  if (type === 'gesture') return <div className="gesture-art" aria-hidden="true"><svg viewBox="0 0 200 150" fill="none"><path d="m66 122-17-38c-5-14 7-20 14-7l9 16-5-59c-1-14 13-15 15-1l5 40 2-55c1-14 15-13 15 1l-1 54 9-45c3-13 16-10 13 4l-8 48 12-25c6-12 18-6 12 7l-11 34c-3 13-2 27-14 38Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /><g fill="var(--accent)">{[[66,122],[49,84],[72,93],[67,34],[87,73],[89,18],[103,73],[112,28],[117,80],[129,55],[130,96],[116,134]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" />)}</g><path d="M25 48V25h23m104 0h23v23M25 107v23h23m127-23v23h-23" stroke="currentColor" opacity=".3" /></svg><span>OpenCV × MediaPipe</span></div>;
  return <div className="data-art" aria-hidden="true"><div className="chart-heading"><span>DATA / EXPLORATION</span><span>↗</span></div><div className="chart-bars">{[35,57,44,76,60,92,73,86,65,100,84,112].map((height,i)=><i key={i} style={{height,opacity:.35+i*.05}} />)}</div><div className="chart-axis"><span>01</span><span>06</span><span>12</span></div></div>;
}
