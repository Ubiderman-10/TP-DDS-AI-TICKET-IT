import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Usuario } from '../../domain/Usuario.js';
import { RolUsuario, puedeComprar, puedeOrganizar } from '../../domain/RolUsuario.js';
import { ValidationError } from '../../errors/ValidationError.js';

test('Usuario: el rol por defecto es AMBOS', () => {
    const usuario = new Usuario({ nombre: 'Ana', apellido: 'Perez' });
    assert.strictEqual(usuario.rol, RolUsuario.AMBOS);
    assert.ok(puedeComprar(usuario));
    assert.ok(puedeOrganizar(usuario));
});

test('Usuario: un ORGANIZADOR solo puede organizar', () => {
    const usuario = new Usuario({ nombre: 'Ana', apellido: 'Perez', rol: RolUsuario.ORGANIZADOR });
    assert.ok(puedeOrganizar(usuario));
    assert.ok(!puedeComprar(usuario));
});

test('Usuario: un COMPRADOR solo puede comprar', () => {
    const usuario = new Usuario({ nombre: 'Carlos', apellido: 'Gomez', rol: RolUsuario.COMPRADOR });
    assert.ok(puedeComprar(usuario));
    assert.ok(!puedeOrganizar(usuario));
});

test('Usuario: rechaza un rol inexistente', () => {
    assert.throws(() => new Usuario({ nombre: 'Ana', apellido: 'Perez', rol: 'ADMIN' }), ValidationError);
});