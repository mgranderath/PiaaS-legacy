const fs = require('fs-extra');

module.exports = function () {

    log = (error, stdout, stderr) => {
        if(error){
            console.log(error);
        }
        if(stderr){
            console.log(error);
        }
    };

    createFile = (path, content) => {
        let obj = fs.writeFile(path, content);
        return obj;
    };

    getConfig = (key, path) => {
        let config = JSON.parse(fs.readFileSync(path + '/config.json', 'utf8'));
        return config[key];
    };

};
