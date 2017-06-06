'use strict';

const acorn = require('acorn');
const esquery = require('esquery');
const escodegen = require('escodegen');
const estraverse = require('estraverse');
const template = require("estemplate");
const comparify = require('comparify');
const toAST = require('to-ast');
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
    
    is (node, expected) {
        return comparify(node, expected);
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

    replace (options) {
        return estraverse.replace(this.ast, options);
    }

    prepend (node) {
        this.ast.body.unshift(node);
    }

    append (node) {
        this.ast.body.push(node);
    }
    
    wrap (callback) {
        this.ast.body = callback(this.ast.body);
    }
    
    unwrap () {
        let block = this.first('BlockStatement');
        this.ast.body = block.body;
    }
    
    template (source, options) {
        options = options || {};
        if (typeof source === "string") {
            return template(source, options).body;
        }
        return toAST(source, options);
    }
    
    beautify (source, options) {
        return beautify(source, options);
    }
    
    minify (ast) {
        return ast;
    }

    toSource (options) {
        options = options || {};
        
        if (options.minify) {
            this.ast = this.minify(this.ast);
        }
        
        var source = escodegen.generate(this.ast, {
            format: {
                quotes: options.quotes
            }
        });

        if (options.beautify) {
            source = this.beautify(source, {
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

