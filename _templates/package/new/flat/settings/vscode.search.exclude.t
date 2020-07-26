---
inject: true
to: "<%= type != 'flat' ? null : '.vscode/settings.json' %>"
after: search.exclude
append: true
---
		"<%= packageDir %>/index.js": true,
		"<%= packageDir %>/*/**/*.js": true,
		"<%= packageDir %>/**/*.{d.ts,js.map}": true,
