var express = require('express');
var level = require('level');
var uid = require('uid2');

/**
 * Create a new links app.
 *
 * @param {Object=} opts
 * @return {Koa}
 */

module.exports = function(opts) {
  if (!opts) opts = {};
  var db = level('db');
  var app = express();
  
  app.set('view engine', 'jade');
  app.set('views', __dirname);
  
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  
  app.get(/^\/([A-z0-9]{32})?$/, load, show);
  app.put(/^\/([A-z0-9]{32})?$/, express.json(), update);
  app.post('/fork', fork);
  
  /**
   * Load content.
   */
  
  function load(req, res, next) {
    var id = req.params[0];
    if (!id) return next();
    db.get('content:' + id, function(err, content) {
      req.content = content;
      next(err);
    });
  }
  
  /**
   * Show content.
   */
  
  function show(req, res) {
    res.render('index', {
      id: req.params[0],
      content: req.content || '',
      footer: opts.footer
    });
  }
  
  /**
   * Fork content and generate a token.
   */
  
  function fork(req, res, next) {
    var token = uid(32);
    var forkId = uid(32);
    db.put('token:' + forkId, token, function(err) {
      if (err) return next(err);
      res.send({
        token: token,
        id: forkId
      });
    });
  }
  
  /**
   * Update content if tokens match.
   */
  
  function update(req, res, next) {
    var id = req.params[0];
    db.get('token:' + id, function(err, token) {
      if (err) return next(err);
      
      if (token != req.body.token) return res.status(403).end('forbidden');
      db.put('content:' + id, req.body.content, function(err) {
        if (err) return next(err);
        res.send('ok');
      });
    });
  }

  return app;
}