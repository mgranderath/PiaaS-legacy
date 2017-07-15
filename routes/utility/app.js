const exec = require('child_process').exec;
const path = require('path');
const ps = require('ps-node');
const fs = require('fs-extra');
const tar = require('tar-fs');
require('./helper.js')();
class App {
    constructor(name, docker){
        this.name = name;
        this.root = this.path;
        this.exists = fs.exists(this.root);
        this.docker = docker;
        this.dirs = {
            'repo': this.root + '/repo',
            'env': this.root + '/env',
            'srv': this.root + '/srv'
        };
    }

    get path(){
        return './APPS/' + this.name;
    }

    setup(){
        if(this.exists){
            return 'App already exists';
        }
        fs.mkdirSync(this.root);
        for(const key in this.dirs){
            fs.mkdirSync(this.dirs[key]);
        }
        this.setup_git();
        return 'App successfully created';
    }

    setup_git(){
        if(this.exists){
            return 'App already exists';
        }
        let hookpath = path.resolve(this.dirs['repo'] + '/hooks/');
        fs.mkdirSync(hookpath);
        hookpath = hookpath + '/post-receive';
        let hook = ' #!/bin/sh \n '+
            'curl -X PUT -s http://127.0.0.1:8080/api/push?name=' + this.name;
        CreateFile(hookpath, hook);
        fs.chmodSync(hookpath, '0700');
        exec('git init --quiet --bare', { cwd: this.dirs['repo'] }, log);
    }

    remove(){
        if(!this.exists){
            return 'App doesnt exist';
        }
        fs.remove(this.root);
        this.docker.getContainer(this.name)
            .then((container) => {
                container.remove((err, data) => {
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log(err);
            });
        this.docker.getImage(this.name)
            .then((image) => {
                image.remove((err, data) => {
                    console.log(err);
                })
            }).catch((err) => {
            console.log(err);
            });
        return 'App successfully removed';
    }

    push(){
        if(fs.existsSync(this.dirs['srv'] + '/.git')){
            let child = exec('git pull --quiet', { cwd: this.dirs['srv'] }, log);
            child.on('close', () => {
                this.deploy();
            });
        }else{
            let child = exec('git clone --quiet ' + path.resolve(this.dirs['repo']) + ' ' + path.resolve(this.dirs['srv']) , { cwd: this.root }, log);
            child.on('close', () => {
                this.deploy();
            });
        }
    }

    deploy(){
        let dockerpath = path.resolve(this.dirs['srv'] + '/Dockerfile');
        let dockerign = path.resolve(this.dirs['srv'] + '/.dockerignore');
        CreateFile(dockerpath, nodedocker);
        CreateFile(dockerign, nodedockerign);
        let stream = tar.pack(this.dirs['srv']);
        this.docker.buildImage(stream, {t: this.name }).then((stream) => {
            let docker = this.docker;
            let self = this;
            let createOptions = {
                Image: this.name,
                name: this.name,
                ExposedPorts: {'3000/tcp': {} },
                PortBindings: {'3000/tcp': [{ 'HostPort': '5000' }] }
            };
            this.docker.modem.followProgress(stream, onFinished);
            function onFinished(err, output){
                docker.createContainer(createOptions).then((strean) => {
                    docker.modem.followProgress(stream, onFinished);
                    function onFinished(err, output) {
                        self.start();
                    }
                })
            }
        }).catch((err, response) => {
            console.log(err, response)
        });
    }

    get type(){
        if(fs.existsSync(this.dirs['srv'] + '/package.json')){
            return 'Node';
        }else if(fs.existsSync(this.dirs['srv'] + '/requirements.txt')){
            return 'Python';
        }
    }

    start(){
        this.docker.getContainer(this.name)
            .then((container) => {
                container.start((err, data) => {
                    if(err){
                        return err;
                    }
                    return 'App started!';
                })
            })
            .catch((err) => {
                return err;
            })
    }

    stop(){
        this.docker.getContainer(this.name)
            .then((container) => {
                container.stop((err, data) => {
                    console.log(err);
                })
            })
            .catch((err) => {
                console.log(err);
            })
    }

    isRunning(){
        let obj = new Promise((resolve, reject) => {
            this.docker.getContainer(this.name)
                .then((container) => {
                    return container.inspect()
                })
                .then((data, err) => {
                    resolve(data.State['Running']);
                })
        });
        return obj;
    }
}

nodedocker = `
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

nodedockerign = `
node_modules
npm-debug.log
`;

module.exports = App;