import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TipoEntradaService } from '../../service/TipoEntradaService.js';
import { TipoEntradaRepository } from '../../repository/TipoEntradaRepository.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { Usuario } from '../../domain/Usuario.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';

test('TipoEntradaService: crear tipo de entrada para evento', () => {
    const tipoRepo = new TipoEntradaRepository();
    const eventoRepo = new EventoRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new TipoEntradaService(tipoRepo, eventoRepo);

    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = new Categoria({ nombre: 'Musica', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Concierto', descripcion: 'Rock', fecha: '2026-12-01', multimedia: [],
        organizador: org, categoria: cat, tiposEntrada: []
    });
    eventoRepo.save(evento);

    const tipo = service.crear(evento.id, {
        nombre: 'VIP', descripcion: 'Zona VIP', precio: 5000, cupo: 100
    });

    assert.strictEqual(tipo.nombre, 'VIP');
    assert.strictEqual(tipo.precio, 5000);
    assert.strictEqual(tipo.cupo, 100);
    assert.strictEqual(evento.tiposEntrada.length, 1, 'El evento debe tener el tipo de entrada');
});

test('TipoEntradaService: getTiposDeEvento', () => {
    const tipoRepo = new TipoEntradaRepository();
    const eventoRepo = new EventoRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new TipoEntradaService(tipoRepo, eventoRepo);

    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = new Categoria({ nombre: 'Musica', descripcion: 'Desc' });
    const evento = new Evento({
        nombre: 'Concierto', descripcion: 'Rock', fecha: '2026-12-01', multimedia: [],
        organizador: org, categoria: cat, tiposEntrada: []
    });
    eventoRepo.save(evento);

    service.crear(evento.id, { nombre: 'General', descripcion: 'Campo', precio: 1000, cupo: 50 });
    service.crear(evento.id, { nombre: 'VIP', descripcion: 'VIP', precio: 3000, cupo: 20 });

    const tipos = service.getTiposDeEvento(evento.id);
    assert.strictEqual(tipos.length, 2);
});

test('TipoEntradaService: NotFoundError si evento no existe', () => {
    const tipoRepo = new TipoEntradaRepository();
    const eventoRepo = new EventoRepository();
    const service = new TipoEntradaService(tipoRepo, eventoRepo);

    let error = null;
    try {
        service.crear(999, { nombre: 'VIP', descripcion: 'VIP', precio: 5000, cupo: 100 });
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debe lanzar error si el evento no existe');
});
