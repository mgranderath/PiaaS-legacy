const express = require('express');
const router = express.Router();
const path = require('path');
const util = require('util');
const fs = require('fs-extra');
const App = require('./utility/app');
const Docker = require('dockerode-promise-wrapper');

let docker = new Docker({socketPath: '/var/run/docker.sock'});

let root = path.resolve('./APPS/');
let appnames = fs.readdirSync(root).filter((f) => fs.statSync(root+"/"+f).isDirectory());
let apps = {};
for(item of appnames){
    let temp = {};
    temp.instance = new App(item, docker);
    temp.instance.isRunning()
        .then((state) => {
            temp.running = state;
        });
    apps[item] = temp;
}

router.get('/', (req, res) => {
    apps = {};
    appnames = fs.readdirSync(root).filter((f) => fs.statSync(root+"/"+f).isDirectory());
    for(item of appnames){
        let temp = {};
        temp.instance = new App(item, docker);
        temp.instance.isRunning()
            .then((state) => {
                temp.running = state;
            });
        apps[item] = temp;
    }
    let promises = appnames.map((name) =>  {
        return apps[name].instance.isRunning();
    });
    Promise.all(promises)
        .then((results) => {
            let gui = [];
            for(let i = 0; i < results.length; i++){
                let temp = {};
                temp.name = appnames[i];
                temp.running = results[i];
                gui.push(temp);
            }
            res.send(gui);
        });
});

router.put('/add', async (req, res) => {
    let app = new App(req.query.name, docker);
    let temp = {};
    temp.instance = app;
    temp.running = true;
    apps[req.query.name] = temp;
    res.json(await app.setup());
});

router.put('/remove', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    res.json({ message: apps[req.query.name].instance.remove() });
});

router.put('/push', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    apps[req.query.name].instance.push();
    res.send('Push received!');
});

router.put('/start', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    res.json({ message: apps[req.query.name].instance.start() });
});

router.put('/stop', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    apps[req.query.name].instance.stop();
    res.send('App stopped!');
});

router.put('/running', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    apps[req.query.name].instance.isRunning()
        .then((state) => {
            res.json({running: state});
        })
});

module.exports = router;