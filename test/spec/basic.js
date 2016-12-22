import test from 'ava';
import AbstractSyntaxTree from '../../index';

test('it works', t => {
    t.truthy(new AbstractSyntaxTree('var x = 0;'));
});

test('it queries the syntax tree', t => {
    var ast = new AbstractSyntaxTree('var y = 1;');
    var declarations = ast.find('VariableDeclaration');
    t.truthy(declarations.length === 1);
});

test('it checks if node is in the syntax tree', t => {
    var ast = new AbstractSyntaxTree('var z = 2;');
    t.truthy(ast.has('VariableDeclaration'));
});

test('it returns the source', t => {
    var ast = new AbstractSyntaxTree('var a = 3;');
    t.truthy(ast.toSource() === 'var a = 3;');
});

test('it removes nodes', t => {
    var ast = new AbstractSyntaxTree('"use strict"; var b = 4;');
    ast.remove({ type: 'Literal', value: 'use strict' });
    t.truthy(ast.toSource() === 'var b = 4;');
});

test('it removes function declarations', t => {
    var source = 'var a = 1; function hello () { return "world"; }';
    var ast = new AbstractSyntaxTree(source);
    ast.remove({
        type: 'FunctionDeclaration',
        id: {
            type: 'Identifier',
            name: 'hello'
        }
    });
    t.truthy(ast.toSource() === 'var a = 1;');
});

test('it returns the first node', t => {
    var ast = new AbstractSyntaxTree('var a = 1; var b = 2;');
    var declaration = ast.first('VariableDeclaration');
    t.truthy(declaration.declarations[0].id.name === 'a');
});

test('it returns the last node', t => {
    var ast = new AbstractSyntaxTree('var c = 3; var d = 4;');
    var declaration = ast.last('VariableDeclaration');
    t.truthy(declaration.declarations[0].id.name === 'd');
});

test('it works with imports', t => {
    var source = `import _ from 'underscore';`;
    var ast = new AbstractSyntaxTree(source);
    t.truthy(ast.toSource() === source);
});
