import electron from 'electron';
import path from 'path';
import fs from 'fs';

class DataPath {
  get root() {
    return (electron.app).getPath('userData');
  }
  getFolder(type: string) {
    const folder = path.join(this.root, type);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    return folder;
  }
}

export const dataPath = new DataPath();
