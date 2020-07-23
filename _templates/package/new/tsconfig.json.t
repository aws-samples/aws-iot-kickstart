---
to: <%= packageDir %>/tsconfig.json
---
{
  "extends": "../../../configs/workspace/tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": false,
    "skipLibCheck": true,
    "declaration": true,
    "baseUrl": "../../../",
    <%_ if(locals.type === 'nested'){ -%>
    "declarationDir": "./dist",
    "rootDir": "./src",
    "outDir": "./dist"
    <%_ } -%>
    <%_ if(locals.type === 'flat'){ -%>
    "rootDir": "./",
    <%_ } -%>
  },
  "compileOnSave": true,
  <%_ if(locals.type === 'nested'){ -%>
  "exclude": ["node_modules", "dist"],
  "include": ["src"]
  <%_ } -%>
  <%_ if(locals.type === 'flat'){ -%>
  "exclude": ["node_modules", "__test__", "**/*.js"],
  "include": ["**/*.ts"]
  <%_ } -%>
}
