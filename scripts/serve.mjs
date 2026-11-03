import { createServer, preview } from 'vite';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import viteConfig from '../vite.config.js';

const args = process.argv.slice(2);
const isPreview = args[0] === 'preview';
if (isPreview) args.shift();

// Vite accepts --host with or without a hostname.
const normalizedArgs = args.map((argument, index) =>
  argument === '--host' && (!args[index + 1] || args[index + 1].startsWith('-'))
    ? '--host=0.0.0.0'
    : argument);
const { values } = parseArgs({
  args: normalizedArgs,
  options: {
    host: { type: 'string' },
    port: { type: 'string' },
    strictPort: { type: 'boolean' },
    open: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: npm run ${isPreview ? 'preview' : 'dev'} -- [--host [hostname]] [--port number] [--strictPort] [--open]`);
  process.exit(0);
}
if (values.port !== undefined && (!/^\d+$/.test(values.port) || Number(values.port) > 65535)) {
  throw new Error('--port must be an integer between 0 and 65535');
}

const serverOptions = {
  ...(values.host !== undefined && { host: values.host }),
  ...(values.port !== undefined && { port: Number(values.port) }),
  ...(values.strictPort !== undefined && { strictPort: values.strictPort }),
  ...(values.open !== undefined && { open: values.open }),
};
const config = {
  ...viteConfig,
  root: resolve(fileURLToPath(new URL('../', import.meta.url))),
  configFile: false,
  [isPreview ? 'preview' : 'server']: serverOptions,
};

const server = isPreview ? await preview(config) : await createServer(config);
if (!isPreview) await server.listen();
server.printUrls();

async function close() {
  if (isPreview) await new Promise((resolve) => server.httpServer.close(resolve));
  else await server.close();
  process.exit(0);
}
process.once('SIGINT', close);
process.once('SIGTERM', close);
