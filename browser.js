var debounce = require('debounce');
var request = require('superagent');

var textarea = document.querySelector('textarea');
var id = location.pathname.split('/')[2];
var token;

/**
 * On initial edit, fork.
 */

textarea.oninput = function() {
  textarea.oninput = null;

  request
  .post('/fork')
  .end(function(err, res) {
    if (err || !res.ok) return alert(err || res.text);

    token = res.body.token;
    id = res.body.id;

    history.pushState({}, '', '/' + id);
    document.title = id;
    textarea.oninput = save;
    save();
  });
};

/**
 * Save the content.
 */

var save = debounce(function() {
  if (!textarea.value) return;
  
  request
  .put(location.pathname)
  .send({ token: token })
  .send({ content: textarea.value })
  .end(function(err, res) {
    if (err || !res.ok) alert(err || res.text);
  });
}, 500);

/**
 * On pop state, reload.
 */

window.onpopstate = function(e) {
  if (e.state) location = location;  
};
