const express = require('express');
const router = express.Router();
const path = require('path');
const util = require('util');
const fs = require('fs-extra');
import {App} from './utility/app';
const Docker = require('dockerode-promise-wrapper');
import {Request, Response} from 'express';

let docker = new Docker({socketPath: '/var/run/docker.sock'});

let root = path.resolve('./APPS/');

interface app {
    instance: App;
    running: boolean;
}

let getAppNames = (): string[] => {
    return fs.readdirSync(root).filter((f: string) => fs.statSync(root+"/"+f).isDirectory());
};

let getAppInfo = async (): Promise<{[name: string]: app}> => {
    let appnames = getAppNames();
    let apps: {[name: string]: app} = {};
    for(let item of appnames){
        let temp: {instance: App; running: boolean;} = {} as {instance: App, running: boolean};
        temp.instance = new App(item);
        temp.running = await temp.instance.isRunning();
        apps[item] = temp;
    }
    return apps;
};

router.get('/', async (req: Request, res: Response) => {
    res.json(await getAppInfo());
});

router.put('/add', async (req: Request, res: Response) => {
    let app = new App(req.query.name);
    res.json(await app.init());
});

router.put('/remove', async (req: Request, res: Response) => {
    let apps = await getAppInfo();
    res.json({ message: await apps[req.query.name].instance.remove() });
});

router.put('/push', async (req: Request, res: Response) => {
    let apps = await getAppInfo();
    apps[req.query.name].instance.push();
    res.send('Push received!');
});

router.put('/start', async (req: Request, res: Response) => {
    let apps = await getAppInfo();
    res.json({ message: apps[req.query.name].instance.start() });
});

router.put('/stop', async (req: Request, res: Response) => {
    let apps = await getAppInfo();
    apps[req.query.name].instance.stop();
    res.send('App stopped!');
});

router.put('/running', async (req: Request, res: Response) => {
    let apps = await getAppInfo();
    apps[req.query.name].instance.isRunning()
        .then((state: boolean) => {
            res.json({running: state});
        })
});

module.exports = router;