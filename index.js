'use strict';

const acorn = require('acorn');
const esquery = require('esquery');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

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

    remove (node) {
        estraverse.replace(this.ast, {
            leave: function (current, parent) {
                if (current.type === node.type &&
                    current.value === node.value) {
                    return this.remove();
                }
                if (current.expression === null) { this.remove(); }
            }
        });
    }

    toSource () {
        return escodegen.generate(this.ast);
    }

}

module.exports = AbstractSyntaxTree;

