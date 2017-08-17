# PiaaS [WIP] [![Codacy Badge](https://api.codacy.com/project/badge/Grade/033dce0002f642758d8f0634268f6813)](https://www.codacy.com/app/m.granderath/PiaaS?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=magrandera/PiaaS&amp;utm_campaign=Badge_Grade) [![Build Status](https://travis-ci.org/magrandera/PiaaS.svg?branch=master)](https://travis-ci.org/magrandera/PiaaS)

A PaaS built for the Raspberry Pi. Uses Docker, React and Node.js

## Run / Getting started

```shell
yarn install
npm run build
npm start
```

To start the PiaaS server

### Supported Runtimes

- node.js
- python
- any compatible image specified in Docker file

### Supported Config Options

Create a file called **Procfile**

Current options:
- web (mandatory): specifies what command start the application
- memory: specifies available memory for application
- restart:
  - on: specifies whether application should auto restart
  - retries: specifies how many times it should try to restart

## Developing

## Built With

- Docker
- Node.js (> 8.0)
- React

## Setting up Dev

```shell
git clone https://github.com/magrandera/PiaaS.git
cd PiaaS
yarn install
```

## Running Dev Server

```shell
npm run start:dev
```

## Building

```shell
npm run build
```

## Running Tests

```shell
npm run test:mocha
```

