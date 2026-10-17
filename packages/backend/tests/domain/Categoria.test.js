import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Categoria } from '../../domain/Categoria.js';
import { ValidationError } from '../../errors/ValidationError.js';

test('Categoria: crea con nombre y descripcion', () => {
    const c = new Categoria({ nombre: 'Musica', descripcion: 'Eventos musicales' });
    assert.strictEqual(c.nombre, 'Musica');
    assert.strictEqual(c.descripcion, 'Eventos musicales');
});

test('Categoria: lanza ValidationError sin nombre', () => {
    assert.throws(() => new Categoria({ nombre: '', descripcion: 'x' }), ValidationError);
});

test('Categoria: lanza ValidationError sin descripcion', () => {
    assert.throws(() => new Categoria({ nombre: 'Musica', descripcion: '' }), ValidationError);
});
