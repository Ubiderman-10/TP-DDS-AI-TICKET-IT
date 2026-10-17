import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Reseña } from '../../domain/Reseña.js';
import { ValidationError } from '../../errors/ValidationError.js';
import { Usuario } from '../../domain/Usuario.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';

test('Reseña: crea con puntuacion y detalle', () => {
    const comprador = new Usuario({ nombre: 'Juan', apellido: 'Perez' });
    const organizador = new Usuario({ nombre: 'Org', apellido: 'Test' });
    const categoria = new Categoria({ nombre: 'Cat', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Evento',
        descripcion: 'Desc',
        fecha: new Date('2026-12-01').toISOString(),
        multimedia: [],
        organizador,
        categoria,
        tiposEntrada: []
    });
    const r = new Reseña({ comprador, evento, puntuacion: 5, detalle: 'Excelente' });
    assert.strictEqual(r.puntuacion, 5);
    assert.strictEqual(r.detalle, 'Excelente');
});

test('Reseña: valida puntuacion entre 1 y 5', () => {
    const comprador = new Usuario({ nombre: 'Juan', apellido: 'Perez' });
    const organizador = new Usuario({ nombre: 'Org', apellido: 'Test' });
    const categoria = new Categoria({ nombre: 'Cat', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Evento',
        descripcion: 'Desc',
        fecha: new Date('2026-12-01').toISOString(),
        multimedia: [],
        organizador,
        categoria,
        tiposEntrada: []
    });
    assert.throws(() => new Reseña({ comprador, evento, puntuacion: 0, detalle: 'x' }), ValidationError);
    assert.throws(() => new Reseña({ comprador, evento, puntuacion: 6, detalle: 'x' }), ValidationError);
});
