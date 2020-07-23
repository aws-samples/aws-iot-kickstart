---
to: <%= packageDir %>/package.json
sh: cd <%= cwd %> && yarn install
---
{
  <%_ if(locals.private){ -%>
  "private": true,
  <%_ } -%>
  "name": "<%= packageName %>",
  "description": "<%= description %>",
  "version": "<%= version %>",
  "license": "<%= license %>",
  <%_ if(!locals.noAuthor){ -%>
  "author": "<%- author %>",
  <%_ } -%>
  "contributors": [
    "Timothee Cruse <timothee.cruse@gmail.com>",
    "Jeremy Jonas <jay.jonas@hotmail.com>",
    "Greg Varga <contact@gergelyvarga.com>",
    "Mirash Gjolaj <mirash.gjolaj@gmail.com>"
  ],
  <%_ if(locals.homepage){ -%>
  "homepage": "<%- homepage %>",
  <%_ } -%>
  <%_ if(locals.repository){ -%>
  "repository": {
    "type": "git",
    "url": "<%- repository %>"
  },
  <%_ } -%>
  <%_ if(locals.type === 'nested'){ -%>
  "main": "dist/index.js",
  "module": "dist/index.module.js",
  "typings": "dist/index.d.ts",
  "directories": {
    "lib": "dist",
    "test": "test"
  },
  <%_ } -%>
  <%_ if(locals.type === 'flat'){ -%>
  "main": "index.js",
  "module": "index.module.js",
  "typings": "index.d.ts",
  <%_ } -%>
  "scripts": {
    <%_ if(locals.type === 'nested'){ -%>
    "clean": "rm -rf dist",
    <%_ } -%>
    <%_ if(locals.type === 'flat'){ -%>
    "clean": "tsc --build --clean",
    <%_ } -%>
    "prebuild": "yarn clean",
    "build": "tsc --project tsconfig.json",
    "prewatch": "yarn clean",
    "watch": "yarn build --watch",
    "test": "jest"
  }
}
