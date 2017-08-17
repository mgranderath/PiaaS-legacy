const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs-extra');
const tar = require('tar-fs');
const stream = require('stream');
import { log, createFile, onClose, createDockerfile, getConfig, getCreateOptions } from './helper';
const Docker = require('dockerode-promise-wrapper');

const isWin = /^win/.test(process.platform);

let docker: any;
if (isWin) {
  docker = new Docker({ socketPath: '//./pipe/docker_engine' });
} else {
  docker = new Docker({ socketPath: '/var/run/docker.sock' });
}

interface appinfo {
  name: string;
  root: string;
  running: boolean;
  type: {};
}

interface deployresult {
  status: boolean;
  port?: number;
}

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

  /**
   * Gets the info of this application
   * @returns {Promise<appinfo>}
   */
  getInfo = async () : Promise<appinfo> => {
    return {
      name: this.name,
      root: this.root,
      running: await this.isRunning(),
      type: await this.type(),
    };
  }

  /**
   * initializes the directories for this application
   * @returns {Promise<string>}
   */
  initDir = async () : Promise<string> => {
    const exists = await fs.exists(this.root);
    try {
      if (!exists) {
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

  /**
   * initializes the git repository for this application
   * @returns {Promise<string>}
   */
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

  /**
   * Container function that runs the initialization
   * @returns {Promise<any>}
   */
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

  /**
   * Removes the docker image and container
   * @returns {Promise<any>}
   */
  removeDocker = async () : Promise<string> => {
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

  /**
   * Removes the directories of this application
   * @returns {Promise<boolean>}
   */
  removeDirs = async () : Promise<boolean> => {
    try {
      await fs.remove(this.root);
      return true;
    }catch (err) {
      console.log('Error on Remove');
      return false;
    }
  }

  /**
   * Container function to remove the application
   * @returns {Promise<boolean>}
   */
  remove = async () : Promise<boolean> => {
    await this.removeDocker();
    await this.removeDirs();
    return true;
  }

  /**
   * Clones the application from the repository into the server directory
   * @returns {Promise<boolean>}
   */
  push = async () : Promise<boolean> => {
    const result = await fs.emptyDir(this.dirs['srv']);
    const child = exec('git clone --quiet ' + path.resolve(this.dirs['repo']) + ' '
      + path.resolve(this.dirs['srv']), { cwd: this.root }, log);
    return await onClose(child, this);
  }

  /**
   * Creates the docker image and container
   * @returns {Promise<any>}
   */
  deploy = async () : Promise<deployresult> => {
    return new Promise<deployresult>(async (resolve, reject) => {
      const config : any = await getConfig(this.dirs['srv']);
      const stream = tar.pack(this.dirs['srv']);
      if (!fs.existsSync(this.dirs['srv'] + '/Dockerfile')) {
        if (!await createDockerfile(this, config)) {
          resolve({ status: false });
        }
      }
      await this.removeDocker();
      docker.buildImage(stream, { t: this.name })
        .then(async (stream: any) => {
          const options: any = await getCreateOptions(this, config);
          const createOptions = options[0];
          const port = options[1];
          async function onFinished(err: string, output: string) {
            docker.createContainer(createOptions)
              .then(() => {
                resolve({ status: true, port: port });
              })
              .catch((err: string) => {
                console.log(err);
                resolve({ status: false });
              });
          }
          docker.modem.followProgress(stream, onFinished);
        })
        .catch((err: string, response: string) => {
          console.log(err);
          console.log(response);
          resolve({ status: false });
        });
    });
  }

  /**
   * Starts the applications docker container
   * @returns {Promise<any>}
   */
  start = async () : Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const container = await docker.getContainer(this.name);
        container.start()
          .then((err: string, data: any) => {
            if (err) {
              resolve(false);
            }
            resolve(true);
          })
          .catch((err: string) => {
            resolve(false);
          });
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  }

  /**
   * Stops the applications docker container
   * @returns {Promise<any>}
   */
  stop = async () : Promise<boolean> => {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const container = await docker.getContainer(this.name);
        container.stop()
          .then((err: string, data: any) => {
            if (err) {
              resolve(false);
            }
            resolve(true);
          })
          .catch((err: string) => {
            resolve(false);
          });
      } catch (err) {
        console.log(err);
        resolve(false);
      }
    });
  }

  /**
   * Container function for deployment
   * @returns {Promise<any>}
   */
  pipeline = async () => {
    await this.push();
    const deploy = (await this.deploy());
    if (!deploy.status) {
      return { status: false, error: 'Error while deploying' };
    }
    const start = await this.start();
    if (start) {
      return { status: true, message: 'Successfully deployed', port: deploy.port };
    }else {
      return { status: false, error: 'Error while starting' };
    }
  }

  /**
   * Gets whether the applications container is runnning
   * @returns {Promise<any>}
   */
  isRunning = async () : Promise<boolean> => {
    try {
      const container = await docker.getContainer(this.name);
      const data = await container.inspect();
      return data.State['Running'];
    } catch (err) {
      return false;
    }
  }

  /**
   * Returns the application type
   * @returns {Promise<any>}
   */
  type = async () : Promise<{ type: string }> => {
    if (fs.existsSync(this.dirs['srv'] + '/package.json')) {
      return { type: 'node' };
    }else if (fs.existsSync(this.dirs['srv'] + '/requirements.txt')) {
      return { type: 'python' };
    }else {
      return { type: 'not detected' };
    }
  }

  /**
   * Returns a log stream of the container
   * @returns {Promise<any>}
   */
  logs = () : Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const container = await docker.getContainer(this.name);
      container.logs(
        {
          follow: true,
          stdout: true,
          stderr: true,
          timestamps: true,
          tail: 200,
        },
        (err: any, stream: any) => {
          if (err) {
            reject(err);
          }
          resolve(stream);
        });
    });
  }

}
