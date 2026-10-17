import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Mensaje } from '../../domain/Mensaje.js';
import { Usuario } from '../../domain/Usuario.js';
import { Compra } from '../../domain/Compra.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';

test('Mensaje: crea con texto y respondeA opcional', () => {
    const usuario = new Usuario({ nombre: 'U', apellido: 'Test' });
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
    const compra = new Compra({ comprador: usuario, evento, tipoEntrada, cantidad: 1, total: 5000, estado: EstadoCompra.PENDIENTE, mensajes: [] });
    const m = new Mensaje({ emisor: usuario, compra, mensaje: 'Hola', enviado: new Date() });
    assert.strictEqual(m.mensaje, 'Hola');
    assert.strictEqual(m.respondeA, undefined);

    const m2 = new Mensaje({ emisor: usuario, compra, mensaje: 'Respuesta', enviado: new Date(), respondeA: null });
    assert.strictEqual(m2.respondeA, null);
});
