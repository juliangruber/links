var request = require('supertest');
var test = require('tap').test;
var App = require('./');
var Links = require('./lib/links');
var MemDB = require('memdb');
var co = require('co');

test('fork', function(t){
  var db = MemDB();
  var app = App(db);

  request(app.callback())
  .post('/fork')
  .expect(200)
  .end(function(err, res){
    t.error(err);
    t.ok(res.body.token);
    t.ok(res.body.id);

    db.get('token:' + res.body.id, function(err, token){
      t.error(err);
      t.equal(token, res.body.token);
      t.end();
    });
  });
});

test('update', function(t){
  var db = MemDB();
  var app = App(db);
  var links = Links(db);

  t.test('404', function(t){
    t.plan(1);

    request(app.callback())
    .put('/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    .send({})
    .expect(404, t.error.bind(t));
  });

  t.test('403', function(t){
    t.plan(2);

    co(function*(){
      return yield links.fork();
    })(function(err, fork){
      t.error(err);
      
      request(app.callback())
      .put('/' + fork.id)
      .send({ token: 'nope' })
      .expect(403, t.error.bind(t));
    });
  });

  t.test('500', function(t){
    t.plan(2);

    co(function*(){
      return yield links.fork();
    })(function(err, fork){
      t.error(err);
      
      request(app.callback())
      .put('/' + fork.id)
      .send({ token: fork.token })
      .expect(500, t.error.bind(t));
    });
  });

  t.test('200', function(t){
    t.plan(2);

    co(function*(){
      return yield links.fork();
    })(function(err, fork){
      t.error(err);
      
      request(app.callback())
      .put('/' + fork.id)
      .send({ token: fork.token })
      .send({ content: 'content' })
      .expect(200)
      .expect('ok', t.error.bind(t));
    });
  });
});

test('show', function(t){
  var db = MemDB();
  var app = App(db);
  var links = Links(db);

  t.test('200', function(t){
    t.plan(3);

    co(function*(){
      var fork = yield links.fork();
      yield links.update(fork.id, {
        token: fork.token,
        content: 'content'
      });
      return fork;
    })(function(err, fork){
      t.error(err);

      request(app.callback())
      .get('/' + fork.id)
      .expect(200, function(err){
        t.error(err);

        request(app.callback())
        .get('/' + fork.id.substr(0, 4))
        .expect(200, t.error.bind(t));
      });
    });
  });

  t.test('404', function(t){
    t.plan(2);

    request(app.callback())
    .get('/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    .expect(404, function(err){
      t.error(err);

      co(function*(){
        var fork = yield links.fork();
        yield links.update(fork.id, {
          token: fork.token,
          content: 'content'
        });
        return fork;
      })(function(err, fork){
        t.error(err);

        request(app.callback())
        .get('/' + fork.id.substr(0, 3))
        .expect(404, t.error.bind(t));
      });
    });
  });
});

test('links#show(id)', function(t){
  var db = MemDB();
  var links = Links(db);

  co(function*(){
    var forks = yield [links.fork(), links.fork()];

    yield [
      links.update(forks[0].id, {
        token: forks[0].token,
        content: '0'
      }),
      links.update(forks[1].id, {
        token: forks[1].token,
        content: '1'
      })
    ];

    var content = yield links.get(forks[0].id.substr(0, 3));
    t.equal(content, '0');

    content = yield links.get(forks[1].id.substr(0, 3));
    t.equal(content, '1');

    try {
      yield links.get('noooooooo');
    } catch (err) {
      return;
    }
    throw new Error('did not throw');

  })(function(err){
    t.error(err);
    t.end();
  });
});

