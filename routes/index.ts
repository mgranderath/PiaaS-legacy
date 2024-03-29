const express = require('express');
const router = express.Router();
const path = require('path');
import { Request, Response } from 'express';

/**
 * Serves the HTML
 */
router.get('/', (req: Request, res: Response) => {
  console.log('Serving ', req.url);
  res.sendFile(path.resolve('./dist/app.html'));
});

/**
 * Serves the HTML
 */
router.get('/app/:name', (req: Request, res: Response) => {
  console.log('Serving ', req.url);
  res.sendFile(path.resolve('./dist/app.html'));
});

module.exports = router;
