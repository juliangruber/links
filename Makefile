
C8 = node_modules/.bin/component
TAP = node_modules/.bin/tap --harmony

build: components browser.js
	@$(C8) build --out=public

components: component.json
	@$(C8) install

example:
	@bin/links.js --footer="by <a href=http://juliangruber.com/>Julian Gruber</a>"

test:
	@NODE_ENV=test $(TAP) test.js

.PHONY: example test

