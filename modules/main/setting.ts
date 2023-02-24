import path from 'path';
import fs from 'fs';
import { dataPath } from './dataPath';

function parseDataFile(filePath: string, defaults: any) {
  try {
    return JSON.parse(fs.readFileSync(filePath).toString());
  } catch (error) {
    return defaults;
  }
}

class Setting {
  path: string;
  data: any;

  constructor(opts: any) {
    this.path = path.join(dataPath.root, 'setting.json');
    this.data = parseDataFile(this.path, opts.defaults);
  }

  get(key: string, fallback?: string) {
    return this.data[key] ?? fallback;
  }

  set(key: string, val: string) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

export const setting = new Setting({ defaults: { bounds: {} } });
