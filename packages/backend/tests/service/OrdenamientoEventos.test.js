import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CategoriaRepository } from '../../repository/CategoriaRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { TipoEntradaRepository } from '../../repository/TipoEntradaRepository.js';
import { ReseñaRepository } from '../../repository/ReseñaRepository.js';
import { EventoService } from '../../service/EventoService.js';
import { Categoria } from '../../domain/Categoria.js';
import { Reseña } from '../../domain/Reseña.js';
import { Usuario } from '../../domain/Usuario.js';

const dias = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

// Tres eventos con precio minimo, fecha y puntaje de organizador distintos:
//   Barato:  $1000, en 30 dias, organizador con puntaje 2
//   Medio:   $5000, en 10 dias, organizador con puntaje 5
//   Caro:    $9000, en 20 dias, organizador sin reseñas (puntaje 0)
function entorno() {
    const eventoRepo = new EventoRepository();
    const usuarioRepo = new UsuarioRepository();
    const categoriaRepo = new CategoriaRepository();
    const resenaRepo = new ReseñaRepository();
    const service = new EventoService(eventoRepo, categoriaRepo, usuarioRepo, resenaRepo, new TipoEntradaRepository());

    const categoria = categoriaRepo.save(new Categoria({ nombre: 'Musica', descripcion: 'Desc' }));
    const orgA = usuarioRepo.save(new Usuario({ nombre: 'A', apellido: 'Uno' }));
    const orgB = usuarioRepo.save(new Usuario({ nombre: 'B', apellido: 'Dos' }));
    const orgC = usuarioRepo.save(new Usuario({ nombre: 'C', apellido: 'Tres' }));
    const fan = usuarioRepo.save(new Usuario({ nombre: 'Fan', apellido: 'Test' }));

    const crear = (nombre, precio, fecha, organizador) =>
        service.crearEvento({ nombre, descripcion: 'd', fecha, multimedia: [] }, organizador.id, categoria.id, [
            { nombre: 'General', descripcion: 'g', precio, cupo: 10 }
        ]);

    const barato = crear('Barato', 1000, dias(30), orgA);
    const medio = crear('Medio', 5000, dias(10), orgB);
    const caro = crear('Caro', 9000, dias(20), orgC);

    resenaRepo.save(new Reseña({ comprador: fan, evento: barato, puntuacion: 2, detalle: 'regular' }));
    resenaRepo.save(new Reseña({ comprador: fan, evento: medio, puntuacion: 5, detalle: 'excelente' }));

    return { service, eventos: [barato, medio, caro] };
}

const nombres = (lista) => lista.map((e) => e.nombre);

test('ordenarPor precio: menor a mayor (asc) y mayor a menor (desc)', () => {
    const { service, eventos } = entorno();
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'precio', 'asc')), ['Barato', 'Medio', 'Caro']);
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'precio', 'desc')), ['Caro', 'Medio', 'Barato']);
});

test('ordenarPor fecha: mas proxima primero (asc) y mas lejana primero (desc)', () => {
    const { service, eventos } = entorno();
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'fecha', 'asc')), ['Medio', 'Caro', 'Barato']);
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'fecha', 'desc')), ['Barato', 'Caro', 'Medio']);
});

test('ordenarPor puntajeOrganizador: mayor a menor (desc) y menor a mayor (asc)', () => {
    const { service, eventos } = entorno();
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'puntajeOrganizador', 'desc')), ['Medio', 'Barato', 'Caro']);
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'puntajeOrganizador', 'asc')), ['Caro', 'Barato', 'Medio']);
});

test('ordenarPor sin direccion usa el sentido por defecto de cada criterio', () => {
    const { service, eventos } = entorno();
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'precio')), ['Barato', 'Medio', 'Caro']);
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'fecha')), ['Medio', 'Caro', 'Barato']);
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'puntajeOrganizador')), ['Medio', 'Barato', 'Caro']);
});

test('ordenarPor con un criterio desconocido devuelve la lista sin cambios y no modifica la original', () => {
    const { service, eventos } = entorno();
    assert.deepStrictEqual(nombres(service.ordenarPor(eventos, 'inexistente')), nombres(eventos));
    const copia = [...eventos];
    service.ordenarPor(eventos, 'precio', 'desc');
    assert.deepStrictEqual(nombres(eventos), nombres(copia));
});