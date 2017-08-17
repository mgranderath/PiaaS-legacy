import * as fs from 'fs';
import { dockerfiles, dockerignore } from './dockerfile';
const portastic = require('portastic');
const YAML = require('yamljs');

/**
 * Logs the errors of an executions
 * @param {string} error
 * @param {string} stdout
 * @param {string} stderr
 */
export function log(error: string, stdout: string, stderr: string) : void {
  if (error) {
    console.log(error);
  }
  if (stderr) {
    console.log(error);
  }
}

/**
 * Creates a File at path with content
 * @param {string} path - path to directory
 * @param {string} content - content for file
 * @returns {Promise<boolean>}
 */
export async function createFile(path: string, content: string) : Promise<boolean> {
  try {
    await fs.writeFile(path, content, log);
    return true;
  }catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * Returns the config of path
 * @param {string} path
 * @returns {Promise<{}>}
 */
export async function getConfig(path: string) : Promise<{}> {
  return YAML.load(path + '/Procfile');
}

/**
 * Resolves once a execution has stopped
 * @param child - child process
 * @param self - App object
 * @returns {Promise<any>}
 */
export async function onClose(child: any, self: any) : Promise<boolean> {
  const obj = new Promise<boolean>((resolve, reject) => {
    child.on('close', async () => {
      resolve(true);
    });
  });
  return obj;
}

/**
 * Creates the "Dockerfile" and ".dockerignore"
 * @param self - App object
 * @param config - config object
 * @returns {Promise<any>}
 */
export async function createDockerfile(self: any, config: any) : Promise<{}> {
  return new Promise(async (resolve, reject) => {
    const command = config.web;
    let type = await self.type();
    type = type.type;
    const created = await createFile(self.dirs['srv'] + '/Dockerfile', dockerfiles(type, command)) &&
    await createFile(self.dirs['srv'] + '/.dockerignore', dockerignore[type]);
    resolve (created);
  });
}

/**
 * Finds a currently free port
 * @returns {Promise<PromiseLike<any> | Promise<any> | PromiseLike<never | T> | Promise<never | T>>}
 */
export async function getPort() : Promise<number> {
  return portastic.find({ min: 10000, max: 50000, retrieve: 1 })
        .then((port: any) => {
          return port;
        });
}

/**
 * Creates the Docker build configuration
 * @param self - App object
 * @param config - config object
 * @returns {Promise<any>}
 */
export async function getCreateOptions(self: any, config: any) : Promise<{}> {
  return new Promise(async (resolve, reject) => {
    const port = await getPort().then((data) => { return data.toString(); });
    const createOptions = {
      Image: self.name,
      name: self.name,
      Tty: true,
      OpenStdin: false,
      StdinOnce: false,
      ExposedPorts: { '3000/tcp': {} },
      PortBindings: { '3000/tcp': [{ HostPort: port }] },
      Env: [
        'PORT=3000',
      ],
    };
    if (config.memory) {
      Object.assign(
        createOptions,{ Memory: config.memory * 1024 * 1024 },
      );
    }
    if (config.restart.on) {
      if (config.restart.retries) {
        Object.assign(
          createOptions,{ RestartPolicy:
            { MaximumRetryCount: config.restart.retries, Name: 'on-failure' } },
        );
      } else {
        Object.assign(
          createOptions,{ RestartPolicy:
            { MaximumRetryCount: 1, Name: 'on-failure' } },
        );
      }
    }
    const result = [createOptions, port];
    resolve(result);
  });
}


