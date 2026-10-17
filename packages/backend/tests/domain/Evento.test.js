import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Evento } from '../../domain/Evento.js';
import { Usuario } from '../../domain/Usuario.js';
import { Categoria } from '../../domain/Categoria.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';

test('Evento: tuPrecioEstaEntre retorna true si el precio esta en rango', () => {
    const organizador = new Usuario({ nombre: 'Org', apellido: 'Test' });
    const categoria = new Categoria({ nombre: 'Cat', descripcion: 'Desc' });
    const e = new Evento({
        nombre: 'Evento',
        descripcion: 'Desc',
        fecha: new Date('2026-12-01').toISOString(),
        multimedia: [],
        organizador,
        categoria,
        tiposEntrada: [
            new TipoEntrada({ nombre: 'Barata', descripcion: 'Barata', precio: 1000, cupo: 50 }),
            new TipoEntrada({ nombre: 'Cara', descripcion: 'Cara', precio: 5000, cupo: 20 })
        ]
    });
    assert.strictEqual(e.tuPrecioEstaEntre(1000, 5000), true);
    assert.strictEqual(e.tuPrecioEstaEntre(500, 999), false);
    assert.strictEqual(e.tuPrecioEstaEntre(5001, 9999), false);
});
