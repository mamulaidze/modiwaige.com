import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const shouldStartServer = !process.env.PLAYWRIGHT_BASE_URL;
const isWindows = process.platform === 'win32';
const viteBin = isWindows ? 'node_modules\\.bin\\vite.cmd' : 'node_modules/.bin/vite';
const playwrightBin = isWindows
  ? 'node_modules\\.bin\\playwright.cmd'
  : 'node_modules/.bin/playwright';

let server;

try {
  if (shouldStartServer) {
    server = spawn(
      viteBin,
      ['--host', '127.0.0.1', '--port', '4173', '--strictPort'],
      {
        shell: isWindows,
        stdio: 'inherit',
        windowsHide: true,
      },
    );

    await waitForServer(baseURL);
  }

  const result = await runPlaywright(args, baseURL);
  process.exitCode = result;
} finally {
  if (server && !server.killed) {
    server.kill();
  }
}

function runPlaywright(args, url) {
  const testArgs = ['test', '--workers=1', ...args];

  return new Promise((resolve) => {
    const child = spawn(playwrightBin, testArgs, {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: url,
      },
      shell: isWindows,
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function waitForServer(url) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // Vite is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}
