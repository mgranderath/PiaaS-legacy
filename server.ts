const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
const fs = require('fs');

if (!fs.existsSync('./APPS')) {
  fs.mkdirSync('./APPS');
}

app.set('port', port);
app.use(express.static(path.join(__dirname, './dist')));
app.set('view engine', 'ejs');
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.listen(port, () => console.log('Listening on port', port));
