#!/usr/bin/env node --harmony-generators

var Links = require('..');
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));
var port = argv.port || argv.p || 3000;
var app = Links({ footer: argv.footer });

app.listen(port);
console.log('open http://localhost:%s/', port);
