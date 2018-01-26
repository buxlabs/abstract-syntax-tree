# @buxlabs/ast changelog

## 0.9.4
* add: support node >= 4.0.0 ([#40](https://github.com/buxlabs/ast/pull/40/files))

## 0.9.3
* add: mark method
* add: tests that show how to calculate binary expressions or drop if statements

## 0.9.2
* add: accept ast as a param of the constructor

## 0.9.1
* add: static walk method

## 0.9.0
* add: toSourceMap method
* edit: toSource accepts a sourceMap/sourceFile/sourceRoot options
* edit: expose removeByNode and removeBySelector as public methods

## 0.8.2
* add: docs, tests

## 0.8.1
* add: docs

## 0.8.0
* remove: astq

## 0.7.1
* add: browserified version in the build dir

## 0.7.0
* edit: replace js-beautify with prettier

## 0.6.0
* add: support astq query engine for find and query methods

## 0.5.0
* add: walk and traverse methods

## 0.4.3
* add: each and toString methods

## 0.4.2
* add: count method

## 0.4.1
* add: handle string selector in the remove method

## 0.4.0
* edit: switch from acorn to espree
* add: better comments support

## 0.3.5
* add: source field

## 0.3.4
* add: template method

## 0.3.3
* add: unwrap method (e.g. drop iife)

## 0.3.2
* add: is method (you can compare nodes loosely)

## 0.3.1
* add: wrap method (you can wrap the code, e.g. with iife or amd)
* add: minify method (noop, override it to provide extra functionality)

## 0.3.0
* add: beautify method to the class
