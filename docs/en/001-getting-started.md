# Getting Started

The package can be used to analyse and transform scripts written in JavaScript. It allows you to parse the program into an abstract syntax tree, query the tree, change the nodes and then generate a program again.

## Supported Environments

The package is supposed to be primarily used within Node.js. Supported versions are specified in the `package.json` file under the `engines` property.

## Install

```
$ npm install abstract-syntax-tree
```

## Interactive REPL

You can test out the library inside of the REPL provided by Node.js. To open it simply type:

```
$ node
> const { parse } = require('abstract-syntax-tree')
> const tree = parse('const answer = 42')
> console.log(tree)
```
