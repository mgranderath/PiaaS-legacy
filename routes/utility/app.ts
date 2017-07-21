import { runInThisContext } from 'vm';
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs-extra');
const tar = require('tar-fs');
import { log, createFile, onClose, createDockerfile, getConfig, getPort } from './helper';
const Docker = require('dockerode-promise-wrapper');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export class App {
  name: string;
  root: string;
  dirs: { [name: string]: string };

  constructor(name: string) {
    this.name = name;
    this.root = './APPS/' + this.name;
    this.dirs = {
      repo: this.root + '/repo',
      env: this.root + '/env',
      srv: this.root + '/srv',
    };
  }

  initDir = async () : Promise<string> => {
    try {
      if (await !fs.exists(this.root)) {
        await fs.mkdir(this.root);
        for (const key in this.dirs) {
          await fs.mkdir(this.dirs[key]);
        }
        return 'success';
      } else {
        return 'exists';
      }
    } catch (err) {
      return 'err';
    }
  }

  initGit = async () : Promise<string> => {
    let hookpath: string = path.resolve(this.dirs['repo'] + '/hooks/');
    try {
      await fs.mkdir(hookpath);
      hookpath = hookpath + '/post-receive';
      const hook = ' #!/bin/sh \n ' +
        'curl -X PUT -s http://127.0.0.1:8080/api/push?name=' + this.name;
      await createFile(hookpath, hook);
      await fs.chmod(hookpath, '0700');
      exec('git init --quiet --bare', { cwd: this.dirs['repo'] }, log);
      return 'success';
    } catch (err) {
      return 'err';
    }
  }

  init = async () : Promise<{}> => {
    const dir : string = await this.initDir();
    if (dir === 'success') {
      if (await this.initGit() === 'success') {
        return {
          status: true,
          message: 'Successfully initialized',
          repo: path.resolve(this.dirs['repo']),
        };
      }else {
        return {
          status: false,
          err: 'Error while Initializing git',
        };
      }
    }else {
      if (dir === 'exists') {
        return {
          status: false,
          err: 'Error while Initializing Directories - Directories already exist',
        };
      }else {
        return {
          status: false,
          err: 'Error while Initializing Directories - Could not create',
        };
      }
    }
  }

  removeDocker = async () => {
    try {
      const container = await docker.getContainer(this.name);
      await container.remove({ force: true });
      const image = await docker.getImage(this.name);
      await image.remove();
      return 'success';
    }catch (err) {
      return 'err';
    }
  }

  removeDirs = async () => {
    try {
      await fs.remove(this.root);
      return true;
    }catch (err) {
      console.log('Error on Remove');
      return false;
    }
  }

  remove = async () => {
    await this.removeDocker();
    await this.removeDirs();
    return true;
  }

  push = async () : Promise<boolean> => {
    const exists : boolean = await fs.exists(this.dirs['srv'] + '/.git');
    if (exists) {
      const child = exec('git pull --quiet', { cwd: this.dirs['srv'] }, log);
      return await onClose(child, this);
    }else {
      const child = exec('git clone --quiet ' + path.resolve(this.dirs['repo']) + ' ' + path.resolve(this.dirs['srv']),
        { cwd: this.root }, log);
      return await onClose(child, this);
    }
  }

  deploy = async () : Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const config : any = await getConfig(this.dirs['srv']);
      const stream = tar.pack(this.dirs['srv']);
      if (!await createDockerfile(this, config)) {
        resolve({ status: false });
      }
      await this.removeDocker();
      docker.buildImage(stream, { t: this.name })
        .then(async (stream: any) => {
          const port = await getPort().then((data) => { return data.toString(); });
          console.log(port);
          const createOptions = {
            Image: this.name,
            name: this.name,
            Tty: true,
            OpenStdin: false,
            StdinOnce: false,
            ExposedPorts: { '3000/tcp': {} },
            PortBindings: { '3000/tcp': [{ HostPort: port }] },
            Env: [
              'PORT=3000',
            ],
          };
          Object.assign(
            createOptions,
            config.memory ? { Memory: config.memory * 1024 * 1024 } : null);
          async function onFinished(err: string, output: string) {
            docker.createContainer(createOptions)
              .then(() => {
                resolve({ status: true, port: port });
              })
              .catch(() => {
                resolve({ status: false });
              });
          }
          docker.modem.followProgress(stream, onFinished);
        })
        .catch((err: string, response: string) => {
          console.log(err);
          resolve({ status: false });
        });
    });
  }

  start = async () => {
    return new Promise( async (resolve, reject) => {
      try {
        const container = await docker.getContainer(this.name);
        container.start()
          .then((err: string, data: any) => {
            if (err) {
              resolve(false);
            }
            resolve(true);
          });
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  }

  stop = async () => {
    return new Promise( async (resolve, reject) => {
      try {
        const container = await docker.getContainer(this.name);
        container.stop()
          .then((err: string, data: any) => {
            if (err) {
              resolve(false);
            }
            resolve(true);
          });
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  }

  pipeline = async () => {
    await this.push();
    const deploy = (await this.deploy());
    if (!deploy.status) {
      return { status: false, error: 'Error while deploying' };
    }
    const start = await this.start();
    if (start) {
      return { status: true, message: 'Successfully deployed', port: deploy.port };
    }else{
      return { status: false, error: 'Error while starting' };
    }
  }

  isRunning = async () => {
    try {
      const container = await docker.getContainer(this.name);
      const data = await container.inspect();
      return data.State['Running'];
    } catch (err) {
      return false;
    }
  }

  type = async () => {
    if (fs.existsSync(this.dirs['srv'] + '/package.json')) {
      return { type: 'node' };
    }else if (fs.existsSync(this.dirs['srv'] + '/requirements.txt')) {
      return { type: 'python' };
    }else {
      return { type: 'not detected' };
    }
  }

}
