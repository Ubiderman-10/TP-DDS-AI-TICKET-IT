import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CompraService } from '../../service/CompraService.js';
import { CompraRepository } from '../../repository/CompraRepository.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { TipoEntradaRepository } from '../../repository/TipoEntradaRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { CambioEstadoCompraRepository } from '../../repository/CambioEstadoCompraRepository.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';
import { Categoria } from '../../domain/Categoria.js';
import { Evento } from '../../domain/Evento.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';
import { Usuario } from '../../domain/Usuario.js';

test('CompraService: crear compra respeta cupo y calcula total', async () => {
    const compraRepo = new CompraRepository();
    const eventoRepo = new EventoRepository();
    const tipoRepo = new TipoEntradaRepository();
    const usuarioRepo = new UsuarioRepository();
    const cambioRepo = new CambioEstadoCompraRepository();

    const service = new CompraService(compraRepo, eventoRepo, tipoRepo, usuarioRepo, cambioRepo);

    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const comprador = usuarioRepo.save(new Usuario({ nombre: 'Comp', apellido: 'Test' }));
    const cat = new Categoria({ nombre: 'Cat', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Evento',
        descripcion: 'Desc',
        fecha: new Date('2026-12-01T20:00:00.000Z').toISOString(),
        multimedia: [],
        organizador: org,
        categoria: cat,
        tiposEntrada: []
    });
    const tipo = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    evento.tiposEntrada.push(tipo);
    eventoRepo.save(evento);
    tipoRepo.save(tipo);

    const compra = service.comprar(comprador.id, evento.id, tipo.id, 2);
    assert.strictEqual(compra.cantidad, 2);
    assert.strictEqual(compra.total, 10000);
    assert.strictEqual(compra.estado, EstadoCompra.PENDIENTE);
});

test('CompraService: no permite comprar mas del cupo disponible', async () => {
    const compraRepo = new CompraRepository();
    const eventoRepo = new EventoRepository();
    const tipoRepo = new TipoEntradaRepository();
    const usuarioRepo = new UsuarioRepository();
    const cambioRepo = new CambioEstadoCompraRepository();

    const service = new CompraService(compraRepo, eventoRepo, tipoRepo, usuarioRepo, cambioRepo);

    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const comprador = usuarioRepo.save(new Usuario({ nombre: 'Comp', apellido: 'Test' }));
    const cat = new Categoria({ nombre: 'Cat', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Evento',
        descripcion: 'Desc',
        fecha: new Date('2026-12-01T20:00:00.000Z').toISOString(),
        multimedia: [],
        organizador: org,
        categoria: cat,
        tiposEntrada: []
    });
    const tipo = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 1 });
    evento.tiposEntrada.push(tipo);
    eventoRepo.save(evento);
    tipoRepo.save(tipo);

    let error = null;
    try {
        service.comprar(comprador.id, evento.id, tipo.id, 5);
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debería lanzar error por cupo insuficiente');
});
