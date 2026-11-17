import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MensajeService } from '../../service/MensajeService.js';
import { MensajeRepository } from '../../repository/MensajeRepository.js';
import { CompraRepository } from '../../repository/CompraRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { Usuario } from '../../domain/Usuario.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';
import { TipoEntrada } from '../../domain/TipoEntrada.js';
import { Compra } from '../../domain/Compra.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';
import { NotFoundError } from '../../errors/NotFoundError.js';

test('MensajeService: enviar mensaje en una compra', () => {
    const mensajeRepo = new MensajeRepository();
    const compraRepo = new CompraRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new MensajeService(mensajeRepo, compraRepo, usuarioRepo);

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

    const mensaje = service.enviar(compra.id, comprador.id, 'Hola, ¿confirmamos?');
    assert.strictEqual(mensaje.mensaje, 'Hola, ¿confirmamos?');
    assert.strictEqual(mensaje.emisor, comprador);
    assert.strictEqual(mensaje.compra, compra);
});

test('MensajeService: responder a un mensaje', () => {
    const mensajeRepo = new MensajeRepository();
    const compraRepo = new CompraRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new MensajeService(mensajeRepo, compraRepo, usuarioRepo);

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

    const padre = service.enviar(compra.id, comprador.id, 'Mensaje padre');
    const respuesta = service.responder(compra.id, org.id, 'Sí, confirmo', padre.id);

    assert.strictEqual(respuesta.mensaje, 'Sí, confirmo');
    assert.strictEqual(respuesta.respondeA, padre);
});

test('MensajeService: getMensajesDeCompra', () => {
    const mensajeRepo = new MensajeRepository();
    const compraRepo = new CompraRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new MensajeService(mensajeRepo, compraRepo, usuarioRepo);

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

    service.enviar(compra.id, comprador.id, 'Mensaje 1');
    service.enviar(compra.id, comprador.id, 'Mensaje 2');

    const mensajes = service.getMensajesDeCompra(compra.id);
    assert.strictEqual(mensajes.length, 2);
});

test('MensajeService: NotFoundError si compra no existe al enviar', () => {
    const mensajeRepo = new MensajeRepository();
    const compraRepo = new CompraRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new MensajeService(mensajeRepo, compraRepo, usuarioRepo);

    let error = null;
    try {
        service.enviar(999, 1, 'Hola');
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debe lanzar error si la compra no existe');
});

test('MensajeService: NotFoundError si el emisor no existe al enviar o responder', () => {
    const mensajeRepo = new MensajeRepository();
    const compraRepo = new CompraRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new MensajeService(mensajeRepo, compraRepo, usuarioRepo);

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

    assert.throws(() => service.enviar(compra.id, 999, 'Hola'), NotFoundError);
    assert.throws(() => service.responder(compra.id, 999, 'Hola', 1), NotFoundError);
});
