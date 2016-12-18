'use strict';

const acorn = require('acorn');
const esquery = require('esquery');
const escodegen = require('escodegen');

class AbstractSyntaxTree {

    constructor (source) {
        this.ast = acorn.parse(source);
    }

    query (selector) {
        return esquery(this.ast, selector);
    }

    has (selector) {
        return this.query(selector).length > 0;
    }

    toSource () {
        return escodegen.generate(this.ast);
    }

}

module.exports = AbstractSyntaxTree;

