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

/**
 * Gets all App names
 * @returns {string[]}
 */
const getAppNames = (): string[] => {
  return fs.readdirSync(root).filter((f: string) => fs.statSync(root + '/' + f).isDirectory());
};

/**
 * Gets App Infos
 * @returns {Promise<{[p: string]: app}>}
 */
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

/**
 * Gets more detailed App info
 * @returns {Promise<any>}
 */
const getDetails = async () => {
  const appnames = getAppNames();
  const details : any = {};
  for (const item of appnames) {
    const instance = new App(item);
    details[item] = (await instance.getInfo());
  }
  return details;
};

/**
 * Returns all apps
 */
router.get('/', async (req: Request, res: Response) => {
  res.json(await getDetails());
});

/**
 * Adds an App
 */
router.put('/add', async (req: Request, res: Response) => {
  const app = new App(req.query.name);
  res.json(await app.init());
});

/**
 * Removes an App
 */
router.put('/remove', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json({ status: await apps[req.query.name].instance.remove() });
});

/**
 * Deploys an App
 */
router.put('/push', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json(await apps[req.query.name].instance.pipeline());
});

/**
 * Starts an App
 */
router.put('/start', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json({ status: await apps[req.query.name].instance.start() });
});

/**
 * Stops an App
 */
router.put('/stop', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  res.json({ status: await apps[req.query.name].instance.stop() });
});

/**
 * Returns the logs of an App
 */
router.put('/log', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  const stream = await apps[req.query.name].instance.logs();
  stream.pipe(res);
  setTimeout(() => {
    stream.destroy();
    res.end();
  },500);
});

/**
 * Checks whether App is running
 */
router.put('/running', async (req: Request, res: Response) => {
  const apps = await getAppInfo();
  apps[req.query.name].instance.isRunning()
        .then((state: boolean) => {
          res.json({ running: state });
        });
});

module.exports = router;
