import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Usuario } from '../../domain/Usuario.js';
import { ValidationError } from '../../errors/ValidationError.js';

test('Usuario: crea con nombre y apellido', () => {
    const u = new Usuario({ nombre: 'Juan', apellido: 'Perez' });
    assert.strictEqual(u.nombre, 'Juan');
    assert.strictEqual(u.apellido, 'Perez');
    assert.deepStrictEqual(u.favoritos, []);
});

test('Usuario: lanza ValidationError sin nombre', () => {
    assert.throws(() => new Usuario({ nombre: '', apellido: 'Gomez' }), ValidationError);
});

test('Usuario: lanza ValidationError sin apellido', () => {
    assert.throws(() => new Usuario({ nombre: 'Ana' }), ValidationError);
});
