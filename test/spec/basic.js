import test from 'ava';
import AbstractSyntaxTree from '../../index';

test('it works', t => {
    t.truthy(new AbstractSyntaxTree('var x = 0;'));
});

test('it queries the syntax tree', t => {
    var ast = new AbstractSyntaxTree('var y = 1;');
    var declarations = ast.query('VariableDeclaration');
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

