const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
(async () => {
  const mode = process.argv[2], dir = __dirname;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(dir, 'film.html')); await p.evaluate(() => window.ready);
  if (mode === 'stills') {
    for (const t of process.argv.slice(3).map(Number)) { await p.evaluate(t => render(t), t); await p.screenshot({ path: `${dir}/still-${t.toFixed(2)}.png` }); }
  } else {
    const fps = 30, N = 20 * fps, out = process.argv[3];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < N; i++) { await p.evaluate(t => render(t), i / fps); const buf = await p.screenshot({ type: 'jpeg', quality: 95 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 100 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  console.log('errors:', errs); await b.close();
})();
