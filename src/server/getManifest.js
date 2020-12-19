import fs from 'fs';
import { resolve } from 'path';

const getManifest = () => {
  try {
    return JSON.parse(fs.readFileSync(resolve(__dirname, 'public', 'manifest.json')));
  } catch(err) {
    console.log('error: ', err);
  }
};

export default getManifest;
