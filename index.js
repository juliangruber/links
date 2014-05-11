
/**
 * Module dependencies.
 */

var koa = require('koa');
var serve = require('koa-static');
var route = require('koa-route');
var render = require('co-render');
var logger = require('koa-logger');
var parse = require('co-body');
var assert = require('assert');
var debug = require('debug')('links');
var Links = require('./lib/links');

/**
 * Route shortcuts.
 */

var get = route.get;
var post = route.post;
var put = route.put;

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
  assert(db, 'db required');

  var links = Links(db);
  
  /**
   * Koa app.
   */
  
  var app = koa();
  
  if (process.env.NODE_ENV != 'test') app.use(logger());
  app.use(serve(__dirname + '/public'));
  
  app.use(post('/fork', fork));
  app.use(get(/^\/([A-z0-9]{4,32})?$/, show));
  app.use(put(/^\/([A-z0-9]{4,32})?$/, update));
  
  /**
   * Show content.
   */
  
  function* show(id) {
    debug('show %s', id);
    var content = '';
    if (id) content = yield links.get(id);
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
    debug('fork');
    var fork = yield links.fork();
    this.body = fork;
  }
  
  /**
   * Update content if tokens match.
   */
  
  function* update(id) {
    debug('update %s', id);
    var update = yield parse.json(this);
    yield links.update(id, update);
    this.body = 'ok';
  }

  return app;
};

