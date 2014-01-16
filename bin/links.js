#!/usr/bin/env node --harmony

/**
 * Module dependencies.
 */

var Links = require('..');
var minimist = require('minimist');
var level = require('level');
var connect = require('multilevel-connect');

var argv = minimist(process.argv.slice(2));
var port = argv.port || argv.p || 3000;
var dbAddr = argv.db || 'db';

var db = /(^[0-9]+$)|:|@/.test(dbAddr)
  ? connect(dbAddr)
  : level(dbAddr);

var app = Links(db, {
  footer: argv.footer
});

app.listen(port);
console.log('open http://localhost:%s/', port);
