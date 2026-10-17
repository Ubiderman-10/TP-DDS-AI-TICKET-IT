import app from './app.js';
import { createServer } from 'http';

const server = createServer(app);
await new Promise((res) => server.listen(0, res));
const port = server.address().port;
const base = `http://localhost:${port}`;

let pass = 0;
let fail = 0;

function log(ok, name, extra = '') {
    if (ok) { pass++; console.log(`PASS: ${name}${extra ? ' -> ' + extra : ''}`); }
    else { fail++; console.log(`FAIL: ${name}${extra ? ' -> ' + extra : ''}`); }
}

async function req(path, opts = {}) {
    const res = await fetch(`${base}${path}`, {
        ...opts,
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
}

async function t(name, fn) {
    try { await fn(); pass++; console.log(`PASS: ${name}`); }
    catch (e) { fail++; console.log(`FAIL: ${name}: ${e.message}`); }
}

let usuarioOrg, usuarioComp, categoria, evento;

// 1) health
await t('GET /api/health', async () => {
    const r = await req('/api/health');
    if (r.status !== 200 || !r.body.ok) throw new Error(`status=${r.status}`);
});

// 2) usuarios
await t('POST /api/usuarios (organizador)', async () => {
    const r = await req('/api/usuarios', { method: 'POST', body: { nombre: 'Juan', apellido: 'Perez' } });
    if (r.status !== 201 || !r.body.data?.id) throw new Error(`status=${r.status}`);
    usuarioOrg = r.body.data;
});
await t('POST /api/usuarios (comprador)', async () => {
    const r = await req('/api/usuarios', { method: 'POST', body: { nombre: 'Maria', apellido: 'Gomez' } });
    if (r.status !== 201 || !r.body.data?.id) throw new Error(`status=${r.status}`);
    usuarioComp = r.body.data;
});

// 3) categorias
await t('POST /api/categorias', async () => {
    const r = await req('/api/categorias', { method: 'POST', body: { nombre: 'Musica', descripcion: 'Recitales' } });
    if (r.status !== 201 || !r.body.data?.id) throw new Error(`status=${r.status}`);
    categoria = r.body.data;
});
await t('GET /api/categorias', async () => {
    const r = await req('/api/categorias');
    if (r.status !== 200 || !Array.isArray(r.body.data)) throw new Error(`status=${r.status}`);
});

// 4) evento
await t('POST /api/eventos', async () => {
    const r = await req('/api/eventos', {
        method: 'POST',
        body: {
            nombre: 'Recital Rock',
            descripcion: 'Un recital',
            fecha: new Date(Date.now() + 86400000).toISOString(),
            multimedia: [],
            organizadorId: usuarioOrg.id,
            categoriaId: categoria.id,
            tiposEntrada: [{ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 }]
        }
    });
    if (r.status !== 201 || !r.body.data?.id) throw new Error(`status=${r.status} body=${JSON.stringify(r.body)}`);
    evento = r.body.data;
});
await t('GET /api/eventos/:id (detalle)', async () => {
    const r = await req(`/api/eventos/${evento.id}`);
    if (r.status !== 200 || !r.body.data?.id) throw new Error(`status=${r.status}`);
});
await t('GET /api/eventos (listar)', async () => {
    const r = await req('/api/eventos');
    if (r.status !== 200 || !Array.isArray(r.body.data)) throw new Error(`status=${r.status}`);
});
await t('GET /api/eventos?orden=precio', async () => {
    const r = await req('/api/eventos?orden=precio');
    if (r.status !== 200) throw new Error(`status=${r.status}`);
});

// 5) tipos de entrada
await t('GET /api/eventos/:id/tipos-entrada', async () => {
    const r = await req(`/api/eventos/${evento.id}/tipos-entrada`);
    if (r.status !== 200) throw new Error(`status=${r.status}`);
});
const tipoId = evento.tiposEntrada?.[0]?.id;
await t('GET /api/tipos-entrada/:id/disponibilidad', async () => {
    const r = await req(`/api/tipos-entrada/${tipoId}/disponibilidad`);
    if (r.status !== 200) throw new Error(`status=${r.status}`);
});

// 6) compra
await t('POST /api/compras', async () => {
    const r = await req('/api/compras', {
        method: 'POST',
        body: { compradorId: usuarioComp.id, eventoId: evento.id, tipoEntradaId: tipoId, cantidad: 2 }
    });
    if (r.status !== 201 || !r.body.data?.id) throw new Error(`status=${r.status} body=${JSON.stringify(r.body)}`);
});

// 7) organizador ve compras del evento
await t('GET /api/eventos/:id/compras', async () => {
    const r = await req(`/api/eventos/${evento.id}/compras`);
    if (r.status !== 200) throw new Error(`status=${r.status}`);
});

// 8) chat
await t('POST /api/compras/:id/mensajes', async () => {
    const r = await req(`/api/compras/1/mensajes`, {
        method: 'POST',
        body: { usuarioId: usuarioComp.id, texto: 'Hola' }
    });
    if (r.status !== 201) throw new Error(`status=${r.status}`);
});

// 9) organizador ruta
await t('GET /api/organizadores/:id/eventos', async () => {
    const r = await req(`/api/organizadores/${usuarioOrg.id}/eventos`);
    if (r.status !== 200) throw new Error(`status=${r.status}`);
});
await t('GET /api/organizadores/:id/puntaje', async () => {
    const r = await req(`/api/organizadores/${usuarioOrg.id}/puntaje`);
    if (r.status !== 200) throw new Error(`status=${r.status}`);
});

// 10) errores
await t('GET /api/inexistente devuelve 404', async () => {
    const r = await req('/api/inexistente');
    if (r.status !== 404) throw new Error(`esperaba 404, obtuvo ${r.status}`);
});
await t('GET /api/eventos/99999 devuelve 404', async () => {
    const r = await req('/api/eventos/99999');
    if (r.status !== 404) throw new Error(`esperaba 404, obtuvo ${r.status}`);
});

console.log(`\nResultado: ${pass} pasaron, ${fail} fallaron`);
server.close();
process.exit(fail > 0 ? 1 : 0);
