---
inject: true
to: .vscode/settings.json
after: files.exclude
append: true
---
		"<%= packageDir %>/index.js": true,
		"<%= packageDir %>/*/**/*.js": true,
		"<%= packageDir %>/**/*.{d.ts,js.map}": true,
