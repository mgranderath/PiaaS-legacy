const fs = require('fs-extra');
const exec = require('child_process').exec;
const path = require('path');
const ps = require('ps-node');

class App {
    constructor(name){
        this.name = name;
        this.root = this.path;
        this.exists = fs.existsSync(this.root);
        this.dirs = {
            'repo': this.root + '/repo',
            'env': this.root + '/env',
            'srv': this.root + '/srv'
        };
        this.instance = null;
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
        fs.writeFile(hookpath, hook, (err) => {
            if(err) {
                return console.log(err);
            }
        });
        fs.chmodSync(hookpath, '0700');
        exec('git init --quiet --bare', { cwd: this.dirs['repo'] }, log);
    }

    remove(){
        if(!this.exists){
            return 'App doesnt exist';
        }
        fs.remove(this.root);
        exec('docker rm ' + this.name, { cwd: this.dirs['srv'] }, log);
        exec('docker rmi piias/' + this.name, { cwd: this.dirs['srv'] }, log);
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
        ps.lookup({
            command: 'nginx'
        }, function(err, resultList ) {
            if (err) {
                throw new Error( err );
            }
            if(resultList.length === 0){
                exec('nginx -c /Users/maltegranderath/Desktop/PiaaS/NGINX/default', log);
            }else{
                exec('nginx -s reload', log);
            }
        });
        let dockerpath = path.resolve(this.dirs['srv'] + '/Dockerfile');
        let dockerign = path.resolve(this.dirs['srv'] + '/.dockerignore');
        CreateFile(dockerpath, nodedocker);
        CreateFile(dockerign, nodedockerign);
        let child = exec('docker build -t piaas/' + this.name +' .', { cwd: this.dirs['srv'] }, log);
        child.on('close', () => {
            exec('docker run -p 49160:3000 -d --name ' + this.name + ' piaas/' + this.name, { cwd: this.dirs['srv'] }, log);
        });
    }
    //docker stop $(docker ps -q --filter ancestor=<image-name> )
    //docker rm $(docker ps -a -q)
    //docker rmi $(docker images -f "dangling=true" -q)
    get type(){
        if(fs.existsSync(this.dirs['srv'] + '/package.json')){
            return 'Node';
        }else if(fs.existsSync(this.dirs['srv'] + '/requirements.txt')){
            return 'Python';
        }
    }

    start(){
        exec('docker start ' + this.name , { cwd: this.dirs['srv'] }, log);
    }

    stop(){
        exec('docker stop ' + this.name, { cwd: this.dirs['srv'] }, log);
    }
}

log = (error, stdout, stderr) => {
    if(error){
        console.log(error);
    }
    if(stderr){
        console.log(error);
    }
};

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

CreateFile = (path, content) => {
    fs.writeFile(path, content, (err) => {
        if(err) {
            return console.log(err);
        }
    });
};

module.exports = App;