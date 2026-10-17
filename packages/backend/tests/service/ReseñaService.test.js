import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReseñaService } from '../../service/ReseñaService.js';
import { ReseñaRepository } from '../../repository/ReseñaRepository.js';
import { CompraRepository } from '../../repository/CompraRepository.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { Usuario } from '../../domain/Usuario.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';
import { Compra } from '../../domain/Compra.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';

test('ReseñaService: calificar evento con entrada utilizada', () => {
    const resenaRepo = new ReseñaRepository();
    const compraRepo = new CompraRepository();
    const eventoRepo = new EventoRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new ReseñaService(resenaRepo, compraRepo, eventoRepo, usuarioRepo);

    const comprador = usuarioRepo.save(new Usuario({ nombre: 'Comp', apellido: 'Test' }));
    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = new Categoria({ nombre: 'Musica', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Concierto', descripcion: 'Rock', fecha: '2026-12-01', multimedia: [],
        organizador: org, categoria: cat, tiposEntrada: []
    });
    const tipo = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    const compra = new Compra({
        comprador, evento, tipoEntrada: tipo, cantidad: 1, total: 5000,
        estado: EstadoCompra.UTILIZADA, mensajes: []
    });
    compraRepo.save(compra);
    eventoRepo.save(evento);

    const resena = service.calificar(comprador.id, evento.id, 5, 'Excelente');
    assert.strictEqual(resena.puntuacion, 5);
    assert.strictEqual(resena.detalle, 'Excelente');
    assert.strictEqual(resena.comprador, comprador);
    assert.strictEqual(resena.evento, evento);
});

test('ReseñaService: BusinessRuleError si la entrada no fue utilizada', () => {
    const resenaRepo = new ReseñaRepository();
    const compraRepo = new CompraRepository();
    const eventoRepo = new EventoRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new ReseñaService(resenaRepo, compraRepo, eventoRepo, usuarioRepo);

    const comprador = usuarioRepo.save(new Usuario({ nombre: 'Comp', apellido: 'Test' }));
    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = new Categoria({ nombre: 'Musica', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Concierto', descripcion: 'Rock', fecha: '2026-12-01', multimedia: [],
        organizador: org, categoria: cat, tiposEntrada: []
    });
    const tipo = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    const compra = new Compra({
        comprador, evento, tipoEntrada: tipo, cantidad: 1, total: 5000,
        estado: EstadoCompra.PENDIENTE, mensajes: []
    });
    compraRepo.save(compra);
    eventoRepo.save(evento);

    let error = null;
    try {
        service.calificar(comprador.id, evento.id, 5, 'Excelente');
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debe lanzar BusinessRuleError si la entrada no fue utilizada');
});
