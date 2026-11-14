import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CategoriaService } from '../../service/CategoriaService.js';
import { CategoriaRepository } from '../../repository/CategoriaRepository.js';

test('CategoriaService: crear y listar categorias', async () => {
    const repo = new CategoriaRepository();
    const service = new CategoriaService(repo);

    const c1 = service.crear({ nombre: 'Musica', descripcion: 'Eventos musicales' });
    const c2 = service.crear({ nombre: 'Teatro', descripcion: 'Obras' });

    assert.strictEqual(c1.nombre, 'Musica');
    assert.strictEqual(c2.nombre, 'Teatro');

    const todas = service.listar();
    assert.strictEqual(todas.length, 2);
});

test('CategoriaService: lanzar ValidationError si falta nombre o descripcion', async () => {
    const repo = new CategoriaRepository();
    const service = new CategoriaService(repo);

    let error = null;
    try {
        service.crear({ nombre: '', descripcion: 'x' });
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debería lanzar error si falta nombre');

    error = null;
    try {
        service.crear({ nombre: 'X', descripcion: '' });
    } catch (e) {
        error = e;
    }
    assert.ok(error, 'Debería lanzar error si falta descripcion');
});

test('CategoriaService: no permite crear una categoria con un nombre ya existente', async () => {
    const repo = new CategoriaRepository();
    const service = new CategoriaService(repo);

    service.crear({ nombre: 'Arte', descripcion: 'Muestras' });

    assert.throws(() => service.crear({ nombre: '  arte ', descripcion: 'Otra' }), /Ya existe/);
    assert.strictEqual(service.listar().length, 1);
});