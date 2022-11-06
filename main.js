#!/usr/bin/env node

require('dotenv').config();
const argv = require('./cli/command.js');

const tokenInformation = require('./services/tokenService.js');
const {loading} = require('./utils.js');

switch (argv.command) {
  case 'tokenInfo':
    let loadingReference = loading();
    tokenInformation(__dirname, loadingReference);
    break;
  default:
    console.error(`Invalid command: ${cmd}`);
}
