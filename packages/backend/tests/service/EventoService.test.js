import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventoService } from '../../service/EventoService.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { CategoriaRepository } from '../../repository/CategoriaRepository.js';
import { TipoEntradaRepository } from '../../repository/TipoEntradaRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { ReseñaRepository } from '../../repository/ReseñaRepository.js';
import { Categoria } from '../../domain/Categoria.js';
import { Usuario } from '../../domain/Usuario.js';
import { ValidationError } from '../../errors/ValidationError.js';

test('EventoService: crear evento con organizador y categoria', async () => {
    const eventoRepo = new EventoRepository();
    const categoriaRepo = new CategoriaRepository();
    const tipoRepo = new TipoEntradaRepository();
    const usuarioRepo = new UsuarioRepository();
    const resenaRepo = new ReseñaRepository();

    const service = new EventoService(eventoRepo, categoriaRepo, usuarioRepo, resenaRepo);

    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = categoriaRepo.save(new Categoria({ nombre: 'Musica', descripcion: 'Desc' }));

    const evento = service.crearEvento({
        nombre: 'Concierto',
        descripcion: 'Un concierto',
        fecha: new Date('2026-12-01T20:00:00.000Z').toISOString(),
        multimedia: []
    }, org.id, cat.id, [
        { nombre: 'General', descripcion: 'Campo', precio: 1000, cupo: 50 }
    ]);

    assert.ok(evento.id, 'El evento debe tener id asignado');
    assert.strictEqual(evento.nombre, 'Concierto');
    assert.strictEqual(evento.tiposEntrada.length, 1);
    assert.strictEqual(evento.tiposEntrada[0].nombre, 'General');
});

test('EventoService: rechaza eventos con fecha pasada o inválida', () => {
    const eventoRepo = new EventoRepository();
    const categoriaRepo = new CategoriaRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new EventoService(eventoRepo, categoriaRepo, usuarioRepo, new ReseñaRepository());
    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = categoriaRepo.save(new Categoria({ nombre: 'Musica', descripcion: 'Desc' }));
    const datos = { nombre: 'Evento', descripcion: 'Desc', multimedia: [] };

    assert.throws(
        () => service.crearEvento({ ...datos, fecha: new Date(Date.now() - 1000) }, org.id, cat.id),
        ValidationError
    );
    assert.throws(
        () => service.crearEvento({ ...datos, fecha: new Date('invalid') }, org.id, cat.id),
        ValidationError
    );
    assert.strictEqual(eventoRepo.getAll().length, 0);
});

test('EventoService: buscar filtra por texto', async () => {
    const eventoRepo = new EventoRepository();
    const categoriaRepo = new CategoriaRepository();
    const tipoRepo = new TipoEntradaRepository();
    const usuarioRepo = new UsuarioRepository();
    const resenaRepo = new ReseñaRepository();

    const service = new EventoService(eventoRepo, categoriaRepo, usuarioRepo, resenaRepo);

    const org = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const cat = categoriaRepo.save(new Categoria({ nombre: 'Musica', descripcion: 'Desc' }));

    service.crearEvento({
        nombre: 'Concierto de Rock',
        descripcion: 'Rock',
        fecha: new Date('2026-12-01T20:00:00.000Z').toISOString(),
        multimedia: []
    }, org.id, cat.id, []);

    service.crearEvento({
        nombre: 'Teatro Clasico',
        descripcion: 'Teatro',
        fecha: new Date('2026-12-02T20:00:00.000Z').toISOString(),
        multimedia: []
    }, org.id, cat.id, []);

    const resultados = service.buscar({ texto: 'rock' });
    assert.strictEqual(resultados.length, 1);
    assert.strictEqual(resultados[0].nombre, 'Concierto de Rock');
});

test('EventoService: obtenerPorId lanza NotFoundError si no existe', async () => {
    const eventoRepo = new EventoRepository();
    const categoriaRepo = new CategoriaRepository();
    const tipoRepo = new TipoEntradaRepository();
    const usuarioRepo = new UsuarioRepository();
    const resenaRepo = new ReseñaRepository();

    const service = new EventoService(eventoRepo, categoriaRepo, usuarioRepo, resenaRepo);

    let error = null;
    try {
        service.obtenerPorId(99999);
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debería lanzar error para evento inexistente');
});
