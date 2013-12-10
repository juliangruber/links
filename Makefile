
build: components browser.js
				@component build --out=public

components: component.json
				@component install
