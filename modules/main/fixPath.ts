import { exec } from 'child_process';
const detectDefaultShell = () => {
  if (process.platform === 'win32') return process.env.COMSPEC || 'powershell.exe';
  if (process.platform === 'darwin') return process.env.SHELL || '/bin/zsh';
  return process.env.SHELL || '/bin/sh';
};

const fix = () => new Promise<void>(resolve => {
  const shell = detectDefaultShell();
  exec(`${shell} -ilc env`, (e, out) => {
    const path = out.split('\n').find(row => row.startsWith('PATH='))?.split('=')[1];
    if (path) process.env.PATH = path;
    resolve();
  });
});

export default { fix };