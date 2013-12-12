var debounce = require('async-debounce');
var request = require('superagent');

var textarea = document.querySelector('textarea');
var id = location.pathname.split('/')[2];
var token;

/**
 * On initial edit, fork.
 */

textarea.oninput = function() {
  textarea.oninput = null;
  showIndicator();

  request
  .post('/fork')
  .end(function(err, res) {
    if (err || !res.ok) return alert(err || res.text);

    token = res.body.token;
    id = res.body.id;

    history.pushState({}, '', '/' + id);
    textarea.oninput = save;
    save();
  });
};

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
    if (err || !res.ok) alert(err || res.text);
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
