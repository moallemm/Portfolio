import { build } from 'vite';
import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prerender } from './prerender.mjs';
import { verifyBuild } from './verify-build.mjs';
import viteConfig from '../vite.config.js';

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryOutput = resolve(workspace, '.prerender');
// Import the config directly so Vite does not need an extra config-bundling process.
await build({ ...viteConfig, root: workspace, configFile: false });
await build({
  ...viteConfig,
  root: workspace,
  configFile: false,
  build: { ssr: resolve(workspace, 'src/entry-server.jsx'), outDir: temporaryOutput },
});
await prerender();
await verifyBuild();

// Only remove this build's known temporary directory, inside the workspace.
if (dirname(temporaryOutput) !== workspace || !temporaryOutput.endsWith('.prerender')) {
  throw new Error('Unexpected prerender output directory');
}
await rm(temporaryOutput, { recursive: true, force: true });
