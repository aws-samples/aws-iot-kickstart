---
to: <%= packageDir %>/package.json
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
  "main": "dist/index.js",
  "module": "dist/index.module.js",
  "typings": "dist/index.d.ts",
  "directories": {
    "lib": "dist",
    "test": "test"
  },
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc --project tsconfig.json",
    "watch": "yarn build --watch",
    "test": "jest"
  }
}
