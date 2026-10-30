// Assemble public/index.html à partir de src/ : node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const r = f => readFileSync(new URL(`./src/${f}`, import.meta.url), 'utf8');
const engine = r('engine.js').replace("if (typeof module !== 'undefined') module.exports = HD;", '');
const out = r('page.html').replace('/*ENGINE*/', () => engine).replace('/*CONTENT*/', () => r('content.js')).replace('/*APP*/', () => r('app.js'));
writeFileSync(new URL('./public/index.html', import.meta.url), out);
console.log('public/index.html généré');
