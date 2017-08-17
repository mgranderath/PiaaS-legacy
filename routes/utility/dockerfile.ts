const dedent = require('dedent-js');

export function dockerfiles(type: any, cmd: string) : string {
  const command: string = JSON.stringify(cmd.split(/[ ,]+/));
  if (type === 'node') {
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
      CMD ${command}`);
  } else if (type === 'python') {
    return dedent(
      `FROM python:3.5-alpine
      # Create app directory
      RUN mkdir -p /usr/src/app
      WORKDIR /usr/src/app
      # Install app dependencies
      COPY requirements.txt /usr/src/app/
      RUN pip3 install -r requirements.txt
      # Bundle app source
      COPY . /usr/src/app
      EXPOSE 8080
      CMD ${command}`);
  } else {
    return '*.log';
  }
}

export let dockerignore : {[name: string]: any} = {
  node: dedent(
    `
    node_modules
    npm-debug.log
    `),
};
