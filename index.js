'use strict';

const acorn = require('acorn');
const esquery = require('esquery');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const comparify = require('comparify');
const beautify = require("js-beautify").js_beautify;

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

    remove (node, options) {
        options = options || {};
        var count = 0;
        estraverse.replace(this.ast, {
            enter: function (current, parent) {
                if (options.first && count === 1) {
                    return this.break();
                }
                if (comparify(current, node)) {
                    count += 1;
                    return this.remove();
                }
            },
            leave: function (current, parent) {
                if (current.expression === null ||
                    (current.type === 'VariableDeclaration' && current.declarations.length === 0)) {
                    return this.remove();
                }
            }
        });
    }

    toSource (options) {
        options = options || {};
        var source = escodegen.generate(this.ast);
        if (options.beautify) {
            return beautify(source, {
                end_with_newline: true
            });
        }
        return source;
    }

}

module.exports = AbstractSyntaxTree;

