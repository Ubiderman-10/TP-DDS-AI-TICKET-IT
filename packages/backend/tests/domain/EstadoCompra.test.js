import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EstadoCompra } from '../../domain/EstadoCompra.js';

test('EstadoCompra: tiene los 5 estados definidos', () => {
    assert.strictEqual(EstadoCompra.PENDIENTE, 'Pendiente');
    assert.strictEqual(EstadoCompra.CONFIRMADA, 'Confirmada');
    assert.strictEqual(EstadoCompra.UTILIZADA, 'Utilizada');
    assert.strictEqual(EstadoCompra.CANCELADA, 'Cancelada');
    assert.strictEqual(EstadoCompra.REEMBOLSADA, 'Reembolsada');
});

test('EstadoCompra: Object.values devuelve los 5 estados', () => {
    const valores = Object.values(EstadoCompra);
    assert.strictEqual(valores.length, 5);
    assert.ok(valores.includes('Pendiente'));
    assert.ok(valores.includes('Confirmada'));
    assert.ok(valores.includes('Utilizada'));
    assert.ok(valores.includes('Cancelada'));
    assert.ok(valores.includes('Reembolsada'));
});
