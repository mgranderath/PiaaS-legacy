const express = require('express');
const router = express.Router();
const path = require('path');
const util = require('util');
const fs = require('fs-extra');
import { App } from './utility/app';
import { Request, Response } from 'express';

const root = path.resolve('./APPS/');

interface app {
  instance: App;
  running: boolean;
}

const getAppNames = (): string[] => {
  return fs.readdirSync(root).filter((f: string) => fs.statSync(root + '/' + f).isDirectory());
};

const getAppInfo = async (): Promise<{[name: string]: app}> => {
  const appnames = getAppNames();
  const apps: {[name: string]: app} = {};
  for (const item of appnames) {
    const temp: {instance: App; running: boolean;} = {} as {instance: App, running: boolean};
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
  const app = new App(req.query.name);
  res.json(await app.init());
});

router.put('/remove', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json({ message: await apps[req.query.name].instance.remove() });
});

router.put('/push', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json(await apps[req.query.name].instance.pipeline());
});

router.put('/start', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json({ status: await apps[req.query.name].instance.start() });
});

router.put('/stop', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json({ status: await apps[req.query.name].instance.stop() });
});

router.put('/running', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  apps[req.query.name].instance.isRunning()
        .then((state: boolean) => {
          res.json({ running: state });
        });
});

module.exports = router;
