import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Compra } from '../../domain/Compra.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';
import { Usuario } from '../../domain/Usuario.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';

test('Compra: crea con estado PENDIENTE', () => {
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
    const tipoEntrada = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    const c = new Compra({ comprador, evento, tipoEntrada, cantidad: 2, total: 10000, estado: EstadoCompra.PENDIENTE, mensajes: [] });
    assert.strictEqual(c.cantidad, 2);
    assert.strictEqual(c.total, 10000);
    assert.strictEqual(c.estado, EstadoCompra.PENDIENTE);
});

test('Compra: actualizarEstado cambia el estado', () => {
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
    const tipoEntrada = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    const c = new Compra({ comprador, evento, tipoEntrada, cantidad: 1, total: 5000, estado: EstadoCompra.PENDIENTE, mensajes: [] });
    c.actualizarEstado(EstadoCompra.CONFIRMADA);
    assert.strictEqual(c.estado, EstadoCompra.CONFIRMADA);
});
