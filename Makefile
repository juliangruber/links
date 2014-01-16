
build: components browser.js
				@component build --out=public

components: component.json
				@component install

example:
				@bin/links.js --footer="by <a href=http://juliangruber.com/>Julian Gruber</a>"

.PHONY: example
