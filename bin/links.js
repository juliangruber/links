#!/usr/bin/env node --harmony

/**
 * Module dependencies.
 */

var Links = require('..');
var minimist = require('minimist');
var level = require('level');
var multilevel = require('multilevel');
var reconnect = require('reconnect-net');

var argv = minimist(process.argv.slice(2));
var port = argv.port || argv.p || 3000;

var app = Links({
  footer: argv.footer,
  db: argv.db
});

app.listen(port);
console.log('open http://localhost:%s/', port);
