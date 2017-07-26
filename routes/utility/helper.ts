import * as fs from 'fs';
import { dockerfiles, dockerignore } from './dockerfile.js';
const portastic = require('portastic');
const YAML = require('yamljs');

export function log(error: string, stdout: string, stderr: string) {
  if (error) {
    console.log(error);
  }
  if (stderr) {
    console.log(error);
  }
}

export async function createFile(path: string, content: string) : Promise<boolean> {
  try {
    await fs.writeFile(path, content, log);
    return true;
  }catch (err) {
    console.log(err);
    return false;
  }
}

export async function getConfig(path: string) {
  return YAML.load(path + '/Procfile');
}

export async function onClose(child: any, self: any) : Promise<any> {
  const obj = new Promise((resolve, reject) => {
    child.on('close', async () => {
      resolve(true);
    });
  });
  return obj;
}

export async function createDockerfile(self: any, config: any) {
  return new Promise( async (resolve, reject) => {
    const command = config.web || 'npm start';
    let type = await self.type();
    type = type.type;
    const created = await createFile(self.dirs['srv'] + '/Dockerfile', dockerfiles(type, command)) &&
    await createFile(self.dirs['srv'] + '/.dockerignore', dockerignore[type]);
    resolve (created);
  });
}

export async function getPort() {
  return portastic.find({ min: 10000, max: 50000, retrieve: 1 })
        .then((port: any) => {
          return port;
        });
}


