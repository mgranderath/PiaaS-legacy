    import * as fs from 'fs';
    export function log(error: string, stdout: string, stderr: string){
        if(error){
            console.log(error);
        }
        if(stderr){
            console.log(error);
        }
    }

    export async function createFile (path: string, content: string){
        await fs.writeFile(path, content, log);
    }

    export function getConfig(key: string, path: string){
        let config = JSON.parse(fs.readFileSync(path + '/config.json', 'utf8'));
        return config[key];
    }


