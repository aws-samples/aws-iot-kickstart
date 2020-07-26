---
to: <%= packageDir %>/.vscode/settings.json
---
{
	// Folder must be added to root workspace to take effect

	"search.exclude": {
		<%_ if(locals.type === 'nested'){ -%>
		"index.js": true,
		"*/**/*.js": true,
		"**/*.{d.ts,js.map}": true,
		<%_ } -%>
	},
	"files.exclude": {
		<%_ if(locals.type === 'nested'){ -%>
		"index.js": true,
		"*/**/*.js": true,
		"**/*.{d.ts,js.map}": true,
		<%_ } -%>
	}
}
