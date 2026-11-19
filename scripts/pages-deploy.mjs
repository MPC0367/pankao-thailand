/**
 * Publish the labelled public preview to GitHub Pages (https://mpc0367.github.io/pankao-thailand/).
 *   npm run pages:deploy
 * Only on the owner's word. It refuses an uncommitted tree, builds with `build:pages`, runs
 * `crawl:pages`, then force-pushes dist-pages/pankao-thailand/ as the only commit of `gh-pages`.
 * The way back: push an earlier build the same way, or turn Pages off in the repo's settings.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REMOTE = 'https://github.com/MPC0367/pankao-thailand.git';
const run = (cmd, args, cwd = ROOT) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' }).trim();

if (run('git', ['status', '--porcelain'])) { console.error('pages:deploy: commit your changes first (the preview names the commit it was built from).'); process.exit(1); }
execFileSync('npm', ['run', '-s', 'build:pages'], { cwd: ROOT, stdio: 'inherit' });
execFileSync('npm', ['run', '-s', 'crawl:pages'], { cwd: ROOT, stdio: 'inherit' });

const src = run('git', ['rev-parse', '--short', 'HEAD']);
const name = run('git', ['config', 'user.name']);
const email = run('git', ['config', 'user.email']);
const dir = mkdtempSync(join(tmpdir(), 'pankao-pages-'));
try {
  cpSync(join(ROOT, 'dist-pages', 'pankao-thailand'), dir, { recursive: true });
  run('git', ['init', '-q', '-b', 'gh-pages'], dir);
  run('git', ['add', '-A'], dir);
  run('git', ['-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '-m', `Labelled public preview, built from ${src} (npm run build:pages)`], dir);
  run('git', ['push', '-q', '-f', REMOTE, 'HEAD:gh-pages'], dir);
  console.log(`pages:deploy: gh-pages = ${run('git', ['rev-parse', '--short', 'HEAD'], dir)} from ${src}. Check it: node tests/e2e/pages-smoke.mjs --url=https://mpc0367.github.io/pankao-thailand`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
