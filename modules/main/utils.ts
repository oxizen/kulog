export const sleep = (dura: number) => new Promise<void>(resolve => setTimeout(resolve, dura));

export const detectDefaultShell = () => {
  if (process.platform === 'win32') return process.env.COMSPEC || 'powershell.exe';
  if (process.platform === 'darwin') return process.env.SHELL || '/bin/zsh';
  return process.env.SHELL || '/bin/sh';
};
