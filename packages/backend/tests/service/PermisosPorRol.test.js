import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CategoriaRepository } from '../../repository/CategoriaRepository.js';
import { UsuarioRepository } from '../../repository/UsuarioRepository.js';
import { EventoRepository } from '../../repository/EventoRepository.js';
import { TipoEntradaRepository } from '../../repository/TipoEntradaRepository.js';
import { CompraRepository } from '../../repository/CompraRepository.js';
import { MensajeRepository } from '../../repository/MensajeRepository.js';
import { ReseñaRepository } from '../../repository/ReseñaRepository.js';
import { CambioEstadoCompraRepository } from '../../repository/CambioEstadoCompraRepository.js';
import { UsuarioService } from '../../service/UsuarioService.js';
import { EventoService } from '../../service/EventoService.js';
import { CompraService } from '../../service/CompraService.js';
import { MensajeService } from '../../service/MensajeService.js';
import { Categoria } from '../../domain/Categoria.js';
import { EstadoCompra } from '../../domain/EstadoCompra.js';
import { RolUsuario } from '../../domain/RolUsuario.js';
import { AuthorizationError } from '../../errors/AuthorizationError.js';
import { BusinessRuleError } from '../../errors/BusinessRuleError.js';
import { ValidationError } from '../../errors/ValidationError.js';

// Arma todo el sistema en memoria, igual que app.js, con un organizador, un comprador y un tercero.
function entorno() {
    const categoriaRepo = new CategoriaRepository();
    const usuarioRepo = new UsuarioRepository();
    const eventoRepo = new EventoRepository();
    const tipoRepo = new TipoEntradaRepository();
    const compraRepo = new CompraRepository();
    const mensajeRepo = new MensajeRepository();
    const resenaRepo = new ReseñaRepository();
    const cambioRepo = new CambioEstadoCompraRepository();

    const usuarioService = new UsuarioService(usuarioRepo, eventoRepo);
    const eventoService = new EventoService(eventoRepo, categoriaRepo, usuarioRepo, resenaRepo, tipoRepo);
    const compraService = new CompraService(compraRepo, eventoRepo, tipoRepo, usuarioRepo, cambioRepo);
    const mensajeService = new MensajeService(mensajeRepo, compraRepo, usuarioRepo);

    const organizador = usuarioService.crearUsuario({ nombre: 'Ana', apellido: 'Org', rol: RolUsuario.ORGANIZADOR });
    const comprador = usuarioService.crearUsuario({ nombre: 'Carlos', apellido: 'Comp', rol: RolUsuario.COMPRADOR });
    const tercero = usuarioService.crearUsuario({ nombre: 'Lucia', apellido: 'Otra', rol: RolUsuario.COMPRADOR });
    const categoria = categoriaRepo.save(new Categoria({ nombre: 'Musica', descripcion: 'Eventos musicales' }));

    const manana = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const evento = eventoService.crearEvento(
        { nombre: 'Confeti Fest', descripcion: 'Festival', fecha: manana, multimedia: [] },
        organizador.id,
        categoria.id,
        [{ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 10 }]
    );
    const tipo = evento.tiposEntrada[0];

    return { usuarioService, eventoService, compraService, mensajeService, tipoRepo, categoria, organizador, comprador, tercero, evento, tipo };
}

// ---------- Crear eventos ----------

test('EventoService: un COMPRADOR no puede crear eventos', () => {
    const { eventoService, comprador, categoria } = entorno();
    const datos = { nombre: 'X', descripcion: 'Y', fecha: new Date(Date.now() + 86400000).toISOString(), multimedia: [] };
    assert.throws(() => eventoService.crearEvento(datos, comprador.id, categoria.id, []), AuthorizationError);
});

test('EventoService: un usuario AMBOS puede crear eventos', () => {
    const { usuarioService, eventoService, categoria } = entorno();
    const ambos = usuarioService.crearUsuario({ nombre: 'Doble', apellido: 'Rol' });
    const datos = { nombre: 'X', descripcion: 'Y', fecha: new Date(Date.now() + 86400000).toISOString(), multimedia: [] };
    const evento = eventoService.crearEvento(datos, ambos.id, categoria.id, []);
    assert.ok(evento.id);
});

test('EventoService: los tipos de entrada creados con el evento quedan guardados con id (se pueden comprar)', () => {
    const { tipoRepo, tipo } = entorno();
    assert.ok(tipo.id, 'el tipo de entrada debe tener id');
    assert.strictEqual(tipoRepo.getById(tipo.id), tipo);
});

// ---------- Comprar ----------

test('CompraService: un ORGANIZADOR no puede comprar entradas', () => {
    const { compraService, organizador, evento, tipo } = entorno();
    assert.throws(() => compraService.comprar(organizador.id, evento.id, tipo.id, 1), AuthorizationError);
});

test('CompraService: un usuario AMBOS no puede comprar entradas de su propio evento', () => {
    const { usuarioService, eventoService, compraService, categoria } = entorno();
    const ambos = usuarioService.crearUsuario({ nombre: 'Doble', apellido: 'Rol' });
    const datos = { nombre: 'Propio', descripcion: 'Y', fecha: new Date(Date.now() + 86400000).toISOString(), multimedia: [] };
    const propio = eventoService.crearEvento(datos, ambos.id, categoria.id, [{ nombre: 'General', descripcion: 'g', precio: 100, cupo: 5 }]);
    assert.throws(() => compraService.comprar(ambos.id, propio.id, propio.tiposEntrada[0].id, 1), BusinessRuleError);
});

test('CompraService: un usuario AMBOS puede comprar el evento de otro organizador', () => {
    const { usuarioService, compraService, evento, tipo } = entorno();
    const ambos = usuarioService.crearUsuario({ nombre: 'Doble', apellido: 'Rol' });
    const compra = compraService.comprar(ambos.id, evento.id, tipo.id, 2);
    assert.strictEqual(compra.estado, EstadoCompra.PENDIENTE);
    assert.strictEqual(compra.total, 10000);
});

test('CompraService: exige una cantidad entera positiva', () => {
    const { compraService, comprador, evento, tipo } = entorno();

    for (const cantidad of [0, -1, 1.5, NaN, Infinity]) {
        assert.throws(
            () => compraService.comprar(comprador.id, evento.id, tipo.id, cantidad),
            ValidationError
        );
    }
});

// ---------- Transiciones de estado y permisos ----------

test('CompraService: confirmar solo lo hacen el comprador o el organizador, y solo desde PENDIENTE', () => {
    const { compraService, comprador, tercero, organizador, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);

    assert.throws(() => compraService.confirmar(compra.id, tercero.id), AuthorizationError);
    assert.strictEqual(compraService.confirmar(compra.id, comprador.id).estado, EstadoCompra.CONFIRMADA);
    // ya no esta pendiente
    assert.throws(() => compraService.confirmar(compra.id, organizador.id), BusinessRuleError);
});

test('CompraService: el organizador puede confirmar el pago', () => {
    const { compraService, comprador, organizador, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);
    assert.strictEqual(compraService.confirmar(compra.id, organizador.id).estado, EstadoCompra.CONFIRMADA);
});

test('CompraService: solo el organizador del evento marca la entrada como utilizada, y solo si esta CONFIRMADA', () => {
    const { compraService, comprador, organizador, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);

    // pendiente: no se puede utilizar
    assert.throws(() => compraService.marcarUtilizada(compra.id, organizador.id), BusinessRuleError);

    compraService.confirmar(compra.id, comprador.id);
    // el comprador no puede marcarse su propia entrada como usada
    assert.throws(() => compraService.marcarUtilizada(compra.id, comprador.id), AuthorizationError);

    assert.throws(() => compraService.marcarUtilizada(compra.id, organizador.id), BusinessRuleError);
    evento.fecha = new Date(Date.now() - 1000).toISOString();
    assert.strictEqual(compraService.marcarUtilizada(compra.id, organizador.id).estado, EstadoCompra.UTILIZADA);
});

test('CompraService: una compra UTILIZADA no se puede cancelar', () => {
    const { compraService, comprador, organizador, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);
    compraService.confirmar(compra.id, comprador.id);
    evento.fecha = new Date(Date.now() - 1000).toISOString();
    compraService.marcarUtilizada(compra.id, organizador.id);
    assert.throws(() => compraService.cancelar(compra.id, comprador.id), BusinessRuleError);
});

test('CompraService: no permite cancelar después de la fecha del evento', () => {
    const { compraService, comprador, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);
    compraService.confirmar(compra.id, comprador.id);
    evento.fecha = new Date(Date.now() - 1000).toISOString();

    assert.throws(() => compraService.cancelar(compra.id, comprador.id), BusinessRuleError);
});

test('CompraService: solo el comprador cancela y una compra cancelada no se cancela de nuevo', () => {
    const { compraService, comprador, tercero, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);

    assert.throws(() => compraService.cancelar(compra.id, tercero.id), AuthorizationError);
    assert.strictEqual(compraService.cancelar(compra.id, comprador.id).estado, EstadoCompra.CANCELADA);
    assert.throws(() => compraService.cancelar(compra.id, comprador.id), BusinessRuleError);
});

test('CompraService: cancelar y reembolsar libera el cupo; un tercero no puede reembolsar', () => {
    const { compraService, comprador, tercero, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 4);
    assert.strictEqual(compraService.disponibilidad(tipo.id), 6);

    // solo se reembolsa lo cancelado
    assert.throws(() => compraService.reembolsar(compra.id, comprador.id), BusinessRuleError);

    compraService.cancelar(compra.id, comprador.id);
    assert.throws(() => compraService.reembolsar(compra.id, tercero.id), AuthorizationError);
    assert.strictEqual(compraService.reembolsar(compra.id, comprador.id).estado, EstadoCompra.REEMBOLSADA);
    assert.strictEqual(compraService.disponibilidad(tipo.id), 10);
});

test('CompraService: no se puede comprar mas que el cupo disponible', () => {
    const { compraService, comprador, tercero, evento, tipo } = entorno();
    compraService.comprar(comprador.id, evento.id, tipo.id, 8);
    assert.throws(() => compraService.comprar(tercero.id, evento.id, tipo.id, 3), BusinessRuleError);
    assert.ok(compraService.comprar(tercero.id, evento.id, tipo.id, 2));
});

test('CompraService: el tipo de entrada tiene que pertenecer al evento que se compra', () => {
    const { eventoService, compraService, comprador, organizador, evento, categoria } = entorno();
    const otro = eventoService.crearEvento(
        { nombre: 'Otro', descripcion: 'd', fecha: new Date(Date.now() + 86400000).toISOString(), multimedia: [] },
        organizador.id,
        categoria.id,
        [{ nombre: 'VIP', descripcion: 'v', precio: 9000, cupo: 5 }]
    );
    const tipoDelOtro = otro.tiposEntrada[0];
    assert.throws(() => compraService.comprar(comprador.id, evento.id, tipoDelOtro.id, 1), ValidationError);
});

// ---------- Chat ----------

test('MensajeService: solo el comprador y el organizador participan del chat de la compra', () => {
    const { compraService, mensajeService, comprador, organizador, tercero, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);

    assert.throws(() => mensajeService.enviar(compra.id, tercero.id, 'hola'), AuthorizationError);
    assert.ok(mensajeService.enviar(compra.id, comprador.id, 'hola'));
    assert.ok(mensajeService.enviar(compra.id, organizador.id, 'respuesta'));
    assert.strictEqual(mensajeService.getMensajesDeCompra(compra.id).length, 2);
});

test('MensajeService: se puede chatear aunque la compra este cancelada (en cualquier momento)', () => {
    const { compraService, mensajeService, comprador, organizador, evento, tipo } = entorno();
    const compra = compraService.comprar(comprador.id, evento.id, tipo.id, 1);
    compraService.cancelar(compra.id, comprador.id);
    assert.ok(mensajeService.enviar(compra.id, comprador.id, 'consulta'));
    assert.ok(mensajeService.enviar(compra.id, organizador.id, 'respuesta'));
});

// ---------- Favoritos ----------

test('UsuarioService: solo los compradores guardan favoritos y no se duplican', () => {
    const { usuarioService, organizador, comprador, evento } = entorno();
    assert.throws(() => usuarioService.agregarFavoritos(organizador.id, evento.id), AuthorizationError);

    usuarioService.agregarFavoritos(comprador.id, evento.id);
    const usuario = usuarioService.agregarFavoritos(comprador.id, evento.id);
    assert.strictEqual(usuario.favoritos.length, 1);
});