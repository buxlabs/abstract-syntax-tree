'use strict';

const acorn = require('acorn');
const esquery = require('esquery');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const comparify = require('comparify');
const beautify = require('js-beautify').js_beautify;

class AbstractSyntaxTree {

    constructor (source) {
        this.comments = [];
        this.ast = this.constructor.parse(source, {
            sourceType: 'module',
            onComment: this.comments
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

    prepend (node) {
        this.ast.body.unshift(node);
    }

    append (node) {
        this.ast.body.push(node);
    }

    toSource (options) {
        options = options || {};
        var source = escodegen.generate(this.ast, {
            format: {
                quotes: options.quotes
            }
        });

        if (options.beautify) {
            source = beautify(source, {
                end_with_newline: true
            });
        }

        if (options.comments) {
            // it would be great to find a better way to attach comments, 
            // this solution simply puts all of the comments at the top of the file
            // so you at least do not lose them
            source = this.comments.map(comment => {
                var value = comment.value.trim();
                if (comment.type === 'Block') {
                    return '/* ' + value + ' */\n';
                }
                return '// ' + value + '\n';
            }).join('') + source;
        }

        return source;
    }
    
    static parse (source, options) {
        return acorn.parse(source, options);
    }

}

module.exports = AbstractSyntaxTree;

