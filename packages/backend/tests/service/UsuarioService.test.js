import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UsuarioService } from '../../service/UsuarioService.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { Usuario } from '../../domain/Usuario.js';
import { Evento } from '../../domain/Evento.js';
import { Categoria } from '../../domain/Categoria.js';

test('UsuarioService: crear usuario', () => {
    const usuarioRepo = new UsuarioRepository();
    const eventoRepo = new EventoRepository();
    const service = new UsuarioService(usuarioRepo, eventoRepo);

    const u = service.crearUsuario({ nombre: 'Juan', apellido: 'Perez' });
    assert.strictEqual(u.nombre, 'Juan');
    assert.strictEqual(u.apellido, 'Perez');
    assert.deepStrictEqual(u.favoritos, []);
});

test('UsuarioService: agregar favoritos', () => {
    const usuarioRepo = new UsuarioRepository();
    const eventoRepo = new EventoRepository();
    const service = new UsuarioService(usuarioRepo, eventoRepo);

    const u = service.crearUsuario({ nombre: 'Juan', apellido: 'Perez' });
    const cat = new Categoria({ nombre: 'Musica', descripcion: 'Desc' });
    const e = new Evento({
        nombre: 'Concierto', descripcion: 'Rock', fecha: '2026-12-01', multimedia: [],
        organizador: u, categoria: cat, tiposEntrada: []
    });
    eventoRepo.save(e);

    const resultado = service.agregarFavoritos(u.id, e.id);
    assert.ok(resultado.favoritos.includes(e), 'El evento debe estar en favoritos');
});

test('UsuarioService: remover favoritos', () => {
    const usuarioRepo = new UsuarioRepository();
    const eventoRepo = new EventoRepository();
    const service = new UsuarioService(usuarioRepo, eventoRepo);

    const u = service.crearUsuario({ nombre: 'Juan', apellido: 'Perez' });
    const cat = new Categoria({ nombre: 'Musica', descripcion: 'Desc' });
    const e = new Evento({
        nombre: 'Concierto', descripcion: 'Rock', fecha: '2026-12-01', multimedia: [],
        organizador: u, categoria: cat, tiposEntrada: []
    });
    eventoRepo.save(e);
    service.agregarFavoritos(u.id, e.id);

    const resultado = service.removerFavoritos(u.id, e.id);
    assert.strictEqual(resultado.favoritos.length, 0, 'No debe haber favoritos');
});

test('UsuarioService: NotFoundError si usuario no existe al agregar favorito', () => {
    const usuarioRepo = new UsuarioRepository();
    const eventoRepo = new EventoRepository();
    const service = new UsuarioService(usuarioRepo, eventoRepo);

    let error = null;
    try {
        service.agregarFavoritos(999, 1);
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debe lanzar error si el usuario no existe');
});

test('UsuarioService: NotFoundError si evento no existe al agregar favorito', () => {
    const usuarioRepo = new UsuarioRepository();
    const eventoRepo = new EventoRepository();
    const service = new UsuarioService(usuarioRepo, eventoRepo);

    const u = service.crearUsuario({ nombre: 'Juan', apellido: 'Perez' });

    let error = null;
    try {
        service.agregarFavoritos(u.id, 999);
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debe lanzar error si el evento no existe');
});
