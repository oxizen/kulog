import path from 'path';
import fs from 'fs';
import { BrowserWindow } from 'electron';

export const install = async (win: BrowserWindow) => {
  const folder = path.join(__dirname, '../devTools');
  try {
    const tools = fs.readdirSync(folder);
    for (const tool of tools) {
      await win.webContents.session.loadExtension(path.join(folder, tool));
    }
  } catch (e) { /* empty */ }
};
