
/**
 * Module dependencies.
 */

var uid = require('uid2');
var assert = require('http-assert');
var wrap = require('co-level');
var read = require('co-read');

/**
 * Expose `Links`.
 */

module.exports = Links;

/**
 * Links model.
 *
 * @param {LevelUp} db
 * @return {Links}
 * @api public
 */

function Links(db){
  if (!(this instanceof Links)) return new Links(db);
  this.db = wrap(db);
};

/**
 * Get content for `id`.
 *
 * If `id` is shorter than 32 chars,
 * find the nearest match.
 *
 * @param {String} id
 * @return {String}
 * @api public
 */

Links.prototype.get = function*(id){
  if (id.length == 32) return yield this.db.get('content:' + id);

  var stream = this.db.createValueStream({
    gt: 'content:' + id,
    lt: 'content:' + id + '\xff',
    limit: 1
  });
  var content = yield read(stream);
  assert(content, 404);
  return content;
};

/**
 * Fork and create a token.
 *
 * @return {Object}
 * @api public
 */

Links.prototype.fork = function*(){
  var token = uid(32);
  var forkId = uid(32);
  yield this.db.put('token:' + forkId, token);
  return {
    token: token,
    id: forkId
  };
};

/**
 * Update content for `id` with `update.content`
 * if `update.token` matches.
 *
 * @param {String} id
 * @param {Object} update
 * @api public
 */

Links.prototype.update = function*(id, update){
  var token = yield this.db.get('token:' + id);
  assert(token == update.token, 403);
  yield this.db.put('content:' + id, update.content);
};

