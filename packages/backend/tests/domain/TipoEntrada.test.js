import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoEntrada } from '../../domain/TipoEntrada.js';
import { ValidationError } from '../../errors/ValidationError.js';

test('TipoEntrada: crea con precio y cupo', () => {
    const t = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    assert.strictEqual(t.nombre, 'General');
    assert.strictEqual(t.precio, 5000);
    assert.strictEqual(t.cupo, 100);
});

test('TipoEntrada: hayCupoPara retorna true si hay suficiente', () => {
    const t = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    assert.strictEqual(t.hayCupoPara(50), true);
    assert.strictEqual(t.hayCupoPara(100), true);
});

test('TipoEntrada: hayCupoPara retorna false si se excede', () => {
    const t = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    assert.strictEqual(t.hayCupoPara(101), false);
});

test('TipoEntrada: lanza ValidationError si falta un campo', () => {
    assert.throws(() => new TipoEntrada({ nombre: 'General', precio: 5000 }), ValidationError);
});
