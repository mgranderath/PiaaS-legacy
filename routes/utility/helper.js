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

    createFile = async (path, content) => {
        await fs.writeFile(path, content);
    };

    getConfig = (key, path) => {
        let config = JSON.parse(fs.readFileSync(path + '/config.json', 'utf8'));
        return config[key];
    };

};
