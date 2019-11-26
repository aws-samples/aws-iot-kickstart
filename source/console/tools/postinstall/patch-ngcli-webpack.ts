// #!/usr/bin/env ts-node

// import * as fs from 'fs-extra';

// // tslint:disable-next-line:max-line-length
// const configFile = `./node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js`;
// const newConfig = `node:
//   {
//     fs: 'empty',
//     global: true,
//     crypto: 'empty',
//     tls: 'empty',
//     net: 'empty',
//     process: true,
//     module: false,
//     clearImmediate: false,
//     setImmediate: false
//   }`;

// fs
//     .readFile(configFile)
//     .then((b: Buffer) => b.toString())
//     .then((contents: string) => contents.replace(/node: false/g, newConfig))
//     .then((config: string) => fs.writeFile(configFile, config).catch(console.log))
