import {create} from "domain";
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs-extra');
const tar = require('tar-fs');
import {log, createFile, onClose, createDockerfile, getConfig} from './helper';
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
        if(await !fs.exists(this.root)){
            try{
                await fs.mkdir(this.root);
                for (const key in this.dirs) {
                    await fs.mkdir(this.dirs[key]);
                }
                const git = await this.initGit();
                if(git === true){
                    return {status: true, message: 'App successfully created!', repo: path.resolve(this.dirs['repo'])};
                }else{
                    return {status: false, error: 'Error while initalizing git'};
                }
            }catch(err){
                return {status: false, error: 'Error while creating directories'};
            }
        }else{
            return {status: false, error: 'App already exists!'};
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
        let result;
        if(await fs.exists(this.dirs['srv'] + '/.git')){
            let child = exec('git pull --quiet', { cwd: this.dirs['srv'] }, log);
            result= await onClose(child, this);
        }else{
            let child = exec('git clone --quiet ' + path.resolve(this.dirs['repo']) + ' ' + path.resolve(this.dirs['srv']) , { cwd: this.root }, log);
            result = await onClose(child, this);
        }
        if(result){
            return {status: true, message: 'App successfully pushed'};
        }else{
            return {status: false, error: 'Error while pushing'};
        }
    };

    deploy = async () => {
        let config = await getConfig(this.dirs['srv']);
        let dockerpath = path.resolve(this.dirs['srv'] + '/Dockerfile');
        let dockerign = path.resolve(this.dirs['srv'] + '/.dockerignore');
        await createDockerfile(this, config);
        try{
            let container = await docker.getContainer(this.name);
            await container.remove({force: true});
            let image = await docker.getImage(this.name);
            await image.remove();
        }catch(err){

        }
        let stream = tar.pack(this.dirs['srv']);
        docker.buildImage(stream, {t: this.name }).then((stream: any) => {
            let self = this;
            let createOptions = {
                Image: this.name,
                name: this.name,
                Tty: true,
                OpenStdin: false,
                StdinOnce: false,
                Memory: config.memory * 1024 * 1024,
                ExposedPorts: {'2999/tcp': {} },
                PortBindings: {'2999/tcp': [{ 'HostPort': '5000' }] },
                Env: [
                    'PORT=2999'
                ]
            };
            docker.modem.followProgress(stream, onFinished);
            function onFinished(err: string, output: string){
                docker.createContainer(createOptions)
                    .then( async () => {
                        return await self.start();
                    })
                    .catch((err: string) => {
                        console.log(err);
                        return false;
                    });
            }
        }).catch((err: string, response: string) => {
            console.log(err);
            return false;
        });
    };

    start = async () => {
        try{
            let container = await docker.getContainer(this.name);
            container.start((err: string, data: any) => {
                if(err){
                    return {status: false, error: 'Error while starting container'};
                }
                return {status: true, message: 'Successfully started'};
            });
        }catch(err){
            console.log(err);
            return {status: false, error: 'Error while selecting container'};
        }
    };

    stop = async () => {
        try{
            let container = await docker.getContainer(this.name);
            container.stop((err: string, data: any) => {
                if(err){
                    console.log(err);
                    return {status: false, error: 'Error while stoping container'};
                }
                return {status: true, message: 'Successfully stopped'};
            });
        }catch(err){
            console.log(err);
            return {status: false, error: 'Error while selecting container'};
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

    type = async () => {
        if(fs.existsSync(this.dirs['srv'] + '/package.json')){
            return {type: 'node'};
        }else if(fs.existsSync(this.dirs['srv'] + '/requirements.txt')){
            return {type: 'python'};
        }else{
            return {type: 'not detected'}
        }
    };

}