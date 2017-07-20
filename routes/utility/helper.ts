import * as fs from 'fs';
import { dockerfiles, dockerignore } from './dockerfile.js';
import * as http from 'http';
const YAML = require('yamljs');

export function log(error: string, stdout: string, stderr: string) {
  if (error) {
    console.log(error);
  }
  if (stderr) {
    console.log(error);
  }
}

export async function createFile(path: string, content: string) {
  await fs.writeFile(path, content, log);
}

export async function getConfig(path: string) {
  return YAML.load(path + '/Procfile');
}

export async function onClose(child: any, self: any) {
  const obj = new Promise((resolve, reject) => {
    child.on('close', async () => {
      self.deploy();
      resolve(true);
    });
  });
  return obj;
}

export async function createDockerfile(self: any, config: any) {
  const command = config.web || 'npm start';
  console.log(config);
  let type = await self.type();
  type = type.type;
  await createFile(self.dirs['srv'] + '/Dockerfile', dockerfiles(type, command));
  await createFile(self.dirs['srv'] + '/.dockerignore', dockerignore[type]);
  return type;
}

export async function getPort() {
  const prom = new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0);
    server.on('listening', function () {
      resolve(server.address().port);
    });
  });
  return prom;
}


