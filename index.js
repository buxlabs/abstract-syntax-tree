'use strict';

const acorn = require('acorn');
const esquery = require('esquery');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const comparify = require('comparify');

class AbstractSyntaxTree {

    constructor (source) {
        this.ast = acorn.parse(source, {
            sourceType: 'module'
        });
    }

    query (node, selector) {
        return esquery(node, selector);
    }

    find (selector) {
        return this.query(this.ast, selector);
    }

    first (selector) {
        return this.find(selector)[0];
    }

    last (selector) {
        var nodes = this.find(selector);
        return nodes[nodes.length - 1];
    }

    has (selector) {
        return this.find(selector).length > 0;
    }

    remove (node) {
        estraverse.replace(this.ast, {
            enter: function (current, parent) {
                if (comparify(current, node)) {
                    this.remove();
                }
            },
            leave: function (current, parent) {
                if (current.expression === null ||
                    (current.type === 'VariableDeclaration' && current.declarations.length === 0)) {
                    this.remove();
                }
            }
        });
    }

    toSource () {
        return escodegen.generate(this.ast);
    }

}

module.exports = AbstractSyntaxTree;

