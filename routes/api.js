const express = require('express');
const router = express.Router();
const path = require('path');
const util = require('util');
const fs = require('fs-extra');
const App = require('./utility/app');

let root = path.resolve('./APPS/');
let appnames = fs.readdirSync(root).filter(f => fs.statSync(root+"/"+f).isDirectory());
let apps = {};
for(item of appnames){
    apps[item] = new App(item);
}

router.get('/', (req, res) => {
    res.json({ apps: appnames });
});

router.put('/add', (req, res) => {
    if(typeof apps[req.query.name] !== 'undefined'){
        res.json({ message: 'App already exists'});
        return;
    }
    let app = new App(req.query.name);
    apps[req.query.name] = app;
    res.json({ message: app.setup() });
});

router.put('/remove', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    res.json({ message: apps[req.query.name].remove() });
});

router.put('/push', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    apps[req.query.name].push();
    res.send('Push received!');
});

router.put('/start', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    apps[req.query.name].start();
    res.send('App started!');
});

router.put('/stop', (req, res) => {
    if(typeof apps[req.query.name] === 'undefined'){
        res.json({ message: 'App doesnt exist'});
        return;
    }
    apps[req.query.name].stop();
    res.send('App stopped!');
});

module.exports = router;