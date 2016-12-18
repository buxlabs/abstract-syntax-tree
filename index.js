'use strict';

const acorn = require('acorn');
const esquery = require('esquery');

class AbstractSyntaxTree {

    constructor (source) {
        this.ast = acorn.parse(source);
    }

    query (selector) {
        return esquery(this.ast, selector);
    }

}

module.exports = AbstractSyntaxTree;

