const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs-extra');
const tar = require('tar-fs');
import {log, createFile} from './helper';
const Docker = require('dockerode-promise-wrapper');

const docker = new Docker({socketPath: '/var/run/docker.sock'});

export class App {
    name: string;
    root: string;
    dirs: { [name: string]: string };

    constructor(name: string){
        this.name = name;
        this.root = './APPS/' + this.name;
        this.dirs = {
            'repo': this.root + '/repo',
            'env': this.root + '/env',
            'srv': this.root + '/srv'
        };
    }

    init = async () => {
        let data = {
            created: false,
            repo: null
        };
        if(await !fs.exists(this.root)){
            try{
                await fs.mkdir(this.root);
                for (const key in this.dirs) {
                    await fs.mkdir(this.dirs[key]);
                }
                const git = await this.initGit();
                if(git === true){
                    data.created = true;
                    data.repo = path.resolve(this.dirs['repo']);
                    return data;
                }
            }catch(err){
                return {error: 'error while creating directories'};
            }
        }else{
            return {error: 'App already exists!'};
        }
    };

    initGit = async () => {
        let hookpath = path.resolve(this.dirs['repo'] + '/hooks/');
        try{
            await fs.mkdir(hookpath);
            hookpath = hookpath + '/post-receive';
            let hook = ' #!/bin/sh \n ' +
                'curl -X PUT -s http://127.0.0.1:8080/api/push?name=' + this.name;
            await createFile(hookpath, hook);
            await fs.chmod(hookpath, '0700');
            exec('git init --quiet --bare', {cwd: this.dirs['repo']}, log);
            return true;
        }catch(err){
            return false;
        }
    };

    remove = async () => {
      await fs.remove(this.root);
      try{
          let container = await docker.getContainer(this.name);
          await container.remove();
          let image = await docker.getImage(this.name);
          await image.remove();
      }catch(err){

      }
        return {message: 'App successfully removed'};
    };

    push = async () => {
      try{
          if(await fs.exists(this.dirs['srv'] + '/.git')){
              let child = exec('git pull --quiet', {cwd: this.dirs['srv']}, log);
              child.on('close', () => {
                  this.deploy();
                  return true;
              });
          }else{
              let child = exec('git clone --quiet ' + path.resolve(this.dirs['repo']) + ' ' + path.resolve(this.dirs['srv']), {cwd: this.root}, log);
              child.on('close', () => {
                  this.deploy();
                  return true;
              });
          }
      }catch(err){
        return false;
      }
    };

    deploy = async () => {
        let dockerpath = path.resolve(this.dirs['srv'] + '/Dockerfile');
        let dockerign = path.resolve(this.dirs['srv'] + '/.dockerignore');
        await createFile(dockerpath, nodedocker);
        await createFile(dockerign, nodedockerign);
        let stream = tar.pack(this.dirs['srv']);
        docker.buildImage(stream, {t: this.name }).then((stream: any) => {
            let self = this;
            let createOptions = {
                Image: this.name,
                name: this.name,
                Tty: true,
                OpenStdin: false,
                StdinOnce: false,
                ExposedPorts: {'3000/tcp': {} },
                PortBindings: {'3000/tcp': [{ 'HostPort': '5000' }] }
            };
            docker.modem.followProgress(stream, onFinished);
            function onFinished(err: string, output: string){
                docker.createContainer(createOptions).then(() => {
                    self.start();
                })
            }
        }).catch((err: string, response: string) => {
            console.log(err, response)
        });
    };

    start = async () => {
        try{
            let container = await docker.getContainer(this.name);
            container.start((err: string, data: any) => {
                if(err){
                    return false;
                }
                return true;
            });
        }catch(err){
            return false;
        }
    };

    stop = async () => {
        try{
            let container = await docker.getContainer(this.name);
            container.stop((err: string, data: any) => {
                if(err){
                    return false;
                }
                return true;
            });
        }catch(err){
            return false;
        }
    };

    isRunning = async () => {
        try {
            let container = await docker.getContainer(this.name);
            let data = await container.inspect();
            return data.State['Running'];
        } catch (err) {
            return false;
        }
    };

}

let nodedocker = `
FROM node:7.7.2-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app
    
EXPOSE 8080
CMD [ "npm", "start" ]
`;

let nodedockerign = `
node_modules
npm-debug.log
`;