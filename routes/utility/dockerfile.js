import * as dedent from 'dedent-js';

export function dockerfiles(type, command){
  command = JSON.stringify(command.split(/[ ,]+/));
  if(type === 'node') {
    return dedent(
      `FROM node:7.7.2-alpine
       # Create app directory
      RUN mkdir -p /usr/src/app
      WORKDIR /usr/src/app
      # Install app dependencies
      COPY package.json /usr/src/app/
      RUN npm install
      # Bundle app source
      COPY . /usr/src/app
      EXPOSE 8080
      CMD ${command}`
    );
  }else{
    return null;
  }
}

export let dockerignore = {
  'node': dedent(
    `
    node_modules
    npm-debug.log
    `
  )
};