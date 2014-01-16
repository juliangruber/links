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
var dbAddr = argv.db || 'db';
var db;

if (/:\d+$/.test(dbAddr)) {
  var db = multilevel.client();
  var segs = dbAddr.split(':');
  
  reconnect(function(con){
    con.pipe(db.createRpcStream()).pipe(con);
  }).connect(segs[1], segs[0]);
} else {
  db = level(dbAddr);
}

var app = Links(db, { footer: argv.footer });

app.listen(port);
console.log('open http://localhost:%s/', port);
