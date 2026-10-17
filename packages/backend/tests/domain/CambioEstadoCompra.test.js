import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CambioEstadoCompra } from '../../domain/CambioEstadoCompra.js';
import { Compra } from '../../domain/Compra.js';
import { Usuario } from '../../domain/Usuario.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';

test('CambioEstadoCompra: crea con estado y quien', () => {
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
    const compra = new Compra({ comprador, evento, tipoEntrada, cantidad: 1, total: 5000, estado: EstadoCompra.PENDIENTE, mensajes: [] });
    const c = new CambioEstadoCompra({ compra, estado: EstadoCompra.CONFIRMADA, quien: comprador });
    assert.strictEqual(c.compra, compra);
    assert.strictEqual(c.estado, EstadoCompra.CONFIRMADA);
    assert.strictEqual(c.quien, comprador);
});
