var debounce = require('async-debounce');
var request = require('superagent');

var textarea = document.querySelector('textarea');
var id = location.pathname.split('/')[2];
var token;
var queue = {};

/**
 * On first edit, fork.
 */

textarea.oninput = function() {
  textarea.oninput = null;
  fork();
};

/**
 * Fork the content.
 */

function fork() {
  showIndicator();
  
  request
  .post('/fork')
  .end(function(err, res) {
    if (err) {
      queue.fork = true;
      hideIndicator();
      offline();
      return;
    }

    token = res.body.token;
    id = res.body.id;
  
    history.pushState({}, '', '/' + id);
    textarea.oninput = save;
    save();
  });
}

/**
 * Save the content.
 */

var save = function() {
  document.title = textarea.value.split('\n')[0];
  showIndicator();
  _save();
};

var _save = debounce(function(done) {
  if (!textarea.value) return done();
  
  request
  .put(location.pathname)
  .send({ token: token })
  .send({ content: textarea.value })
  .end(function(err, res) {
    if (err) {
      queue.save = true;
      offline();
    }
    hideIndicator();
    done();
  });
}, 500);

/**
 * Show saving indicator.
 */

function showIndicator() {
  if ('*' != document.title[0]) document.title = '*' + document.title;
}

/**
 * Hide saving indicator.
 */

function hideIndicator() {
  if ('*' == document.title[0]) document.title = document.title.slice(1);
}

/**
 * On pop state, reload.
 */

window.onpopstate = function(e) {
  if (e.state) location = location;  
};

/**
 * On offline, schedule trying again.
 */

function offline() {
  setTimeout(function() {
    if (queue.fork) fork();
    else if (queue.save) save();
    queue = {};
  }, 1000);
}
