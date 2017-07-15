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

    CreateFile = (path, content) => {
        fs.writeFile(path, content)
            .then(() => {
                return true;
            })
            .catch(() => {
                return false;
            })
    };

    getConfig = (key, path) => {
        let config = JSON.parse(fs.readFileSync(path + '/config.json', 'utf8'));
        return config[key];
    };

};
