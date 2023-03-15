import { exec } from 'child_process';
import { detectDefaultShell } from '@main/utils';
const fix = () => new Promise<void>(resolve => {
  if (process.platform === 'win32') return resolve();
  const shell = detectDefaultShell();
  exec(`${shell} -ilc env`, (e, out) => {
    const path = out.split('\n').find(row => row.startsWith('PATH='))?.split('=')[1];
    if (path) process.env.PATH = path;
    resolve();
  });
});

export default { fix };
