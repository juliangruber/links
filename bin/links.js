#!/usr/bin/env node --harmony-generators

var app = require('..');
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));
var port = argv.port || argv.p || 3000;

app.listen(port);
console.log('open http://localhost:%s/', port);
