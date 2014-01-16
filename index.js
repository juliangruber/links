var koa = require('koa');
var serve = require('koa-static');
var route = require('koa-route');
var get = route.get;
var post = route.post;
var put = route.put;
var render = require('co-render');
var logger = require('koa-logger');
var uid = require('uid2');
var parse = require('co-body');
var wrap = require('co-level');

/**
 * Create a new links app.
 *
 * Options:
 *
 *   - footer: Footer html
 *
 * @param {LevelUp} db
 * @param {Object=} opts
 * @return {Koa}
 */

module.exports = function(db, opts) {
  if (!opts) opts = {};

  db = wrap(db);
  var app = koa();
  
  app.use(logger());
  app.use(serve(__dirname + '/public'));
  
  app.use(get(/^\/([A-z0-9]{32})?$/, show));
  app.use(put(/^\/([A-z0-9]{32})?$/, update));
  app.use(post('/fork', fork));
  
  /**
   * Show content.
   */
  
  function* show(id) {
    var content = '';
    if (id) content = yield db.get('content:' + id);
    this.body = yield render(__dirname + '/index.jade', {
      id: id,
      content: content,
      footer: opts.footer
    });
  }
  
  /**
   * Fork content and generate a token.
   */
  
  function* fork() {
    var token = uid(32);
    var forkId = uid(32);
    yield db.put('token:' + forkId, token);
    this.body = {
      token: token,
      id: forkId
    };
  }
  
  /**
   * Update content if tokens match.
   */
  
  function* update(id) {
    var body = yield parse.json(this);
    var token = yield db.get('token:' + id);
    if (token != body.token) return this.throw(403);
    yield db.put('content:' + id, body.content);
    this.body = 'ok';
  }

  return app;
}