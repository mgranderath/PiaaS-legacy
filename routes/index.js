const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    console.log('Serving ', req.url);
    res.sendFile(path.resolve('./dist/app.html'));
});

module.exports = router;