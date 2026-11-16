import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('dist');
const required = [
  'index.html',
  'styles.css',
  'visual-refresh.css',
  'app.js',
  'site-navigation.js',
  'folding.js',
  'assets/solidos-estudio.png',
  'CNAME',
];
const missing = required.filter(file => !existsSync(resolve(root, file)));
if (missing.length) throw new Error(`Faltan archivos de publicación: ${missing.join(', ')}`);

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const checks = [
  ['documento HTML en español', /<html[^>]+lang="es"/i],
  ['un único h1 de referencia', (html.match(/<h1\b/gi) ?? []).length === 1],
  ['canvas 3D', /id="polyCanvas"/],
  ['fallback WebGL', /id="webglFallback"/],
  ['guía de accesibilidad del plegado', /for="foldRange"/],
  ['carga de la capa visual', /visual-refresh\.css/],
];
for (const [name, test] of checks) {
  const ok = typeof test === 'boolean' ? test : test.test(html);
  if (!ok) throw new Error(`Smoke test falló: ${name}`);
}
console.log(`Smoke test OK · ${required.length} archivos y ${checks.length} comprobaciones`);
