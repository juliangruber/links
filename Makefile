
TAP = node_modules/.bin/tap --harmony

build: components browser.js
				@component build --out=public

components: component.json
				@component install

example:
				@bin/links.js --footer="by <a href=http://juliangruber.com/>Julian Gruber</a>"

test:
	@NODE_ENV=test $(TAP) test.js

.PHONY: example test

