import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../app.js';

test('Swagger UI and the OpenAPI specification are served', async () => {
    const uiResponse = await request(app).get('/api-docs/');
    assert.equal(uiResponse.status, 200);
    assert.match(uiResponse.text, /Swagger UI/);

    const specResponse = await request(app).get('/api-docs/openapi.json');
    assert.equal(specResponse.status, 200);
    assert.equal(specResponse.body.openapi, '3.0.3');

    const documentedOperations = Object.entries(specResponse.body.paths)
        .flatMap(([path, methods]) => Object.keys(methods).map((method) => `${method} ${path}`))
        .sort();
    assert.deepEqual(documentedOperations, [
        'get /health',
        'get /categorias',
        'post /categorias',
        'get /usuarios',
        'post /usuarios',
        'get /usuarios/{usuarioId}',
        'post /usuarios/{usuarioId}/favoritos',
        'delete /usuarios/{usuarioId}/favoritos/{eventoId}',
        'get /usuarios/{usuarioId}/compras',
        'get /eventos',
        'post /eventos',
        'get /eventos/{eventoId}',
        'get /eventos/{eventoId}/tipos-entrada',
        'post /eventos/{eventoId}/tipos-entrada',
        'get /eventos/{eventoId}/compras',
        'get /tipos-entrada/{tipoEntradaId}/disponibilidad',
        'post /compras',
        'put /compras/{compraId}/confirmar',
        'put /compras/{compraId}/utilizar',
        'put /compras/{compraId}/cancelar',
        'put /compras/{compraId}/cancelar-y-reembolsar',
        'put /compras/{compraId}/reembolsar',
        'get /compras/{compraId}/mensajes',
        'post /compras/{compraId}/mensajes',
        'post /compras/{compraId}/mensajes/responder',
        'get /eventos/{eventoId}/resenas',
        'post /eventos/{eventoId}/resenas',
        'get /organizadores/{organizadorId}/eventos',
        'get /organizadores/{organizadorId}/puntaje'
    ].sort());
});
