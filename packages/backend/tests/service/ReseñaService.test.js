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
import { BusinessRuleError } from '../../errors/BusinessRuleError.js';

function crearEntorno({ fechaEvento = new Date(Date.now() - 1000), estado = EstadoCompra.UTILIZADA } = {}) {
    const resenaRepo = new ReseñaRepository();
    const compraRepo = new CompraRepository();
    const eventoRepo = new EventoRepository();
    const usuarioRepo = new UsuarioRepository();
    const service = new ReseñaService(resenaRepo, compraRepo, eventoRepo, usuarioRepo);

    const comprador = usuarioRepo.save(new Usuario({ nombre: 'Comp', apellido: 'Test' }));
    const otroComprador = usuarioRepo.save(new Usuario({ nombre: 'Otra', apellido: 'Test' }));
    const organizador = usuarioRepo.save(new Usuario({ nombre: 'Org', apellido: 'Test' }));
    const evento = new Evento({
        nombre: 'Concierto',
        descripcion: 'Rock',
        fecha: fechaEvento,
        multimedia: [],
        organizador,
        categoria: new Categoria({ nombre: 'Musica', descripcion: 'Desc' }),
        tiposEntrada: []
    });
    const tipoEntrada = new TipoEntrada({ nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 });
    const compra = new Compra({
        comprador,
        evento,
        tipoEntrada,
        cantidad: 1,
        total: 5000,
        estado,
        mensajes: []
    });
    compraRepo.save(compra);
    eventoRepo.save(evento);

    return { service, resenaRepo, compraRepo, comprador, otroComprador, evento, tipoEntrada };
}

test('ReseñaService: calificar evento después de utilizar una entrada', () => {
    const { service, comprador, evento } = crearEntorno();

    const resena = service.calificar(comprador.id, evento.id, 5, 'Excelente');

    assert.strictEqual(resena.puntuacion, 5);
    assert.strictEqual(resena.detalle, 'Excelente');
    assert.strictEqual(resena.comprador, comprador);
    assert.strictEqual(resena.evento, evento);
});

test('ReseñaService: no permite calificar antes de la fecha del evento aunque la entrada figure utilizada', () => {
    const { service, comprador, evento } = crearEntorno({
        fechaEvento: new Date(Date.now() + 60_000)
    });

    assert.throws(
        () => service.calificar(comprador.id, evento.id, 5, 'Excelente'),
        (error) => error instanceof BusinessRuleError && /fecha y hora/.test(error.message)
    );
});

test('ReseñaService: exige una compra utilizada', () => {
    const { service, comprador, evento } = crearEntorno({ estado: EstadoCompra.PENDIENTE });

    assert.throws(
        () => service.calificar(comprador.id, evento.id, 5, 'Excelente'),
        (error) => error instanceof BusinessRuleError && /entrada/.test(error.message)
    );
});

test('ReseñaService: permite una reseña por comprador y evento', () => {
    const { service, compraRepo, comprador, otroComprador, evento, tipoEntrada } = crearEntorno();
    service.calificar(comprador.id, evento.id, 5, 'Excelente');
    compraRepo.save(new Compra({
        comprador,
        evento,
        tipoEntrada,
        cantidad: 1,
        total: 5000,
        estado: EstadoCompra.UTILIZADA,
        mensajes: []
    }));

    assert.throws(
        () => service.calificar(comprador.id, evento.id, 4, 'Otra compra'),
        (error) => error instanceof BusinessRuleError && /una reseña por comprador y evento/.test(error.message)
    );

    compraRepo.save(new Compra({
        comprador: otroComprador,
        evento,
        tipoEntrada,
        cantidad: 1,
        total: 5000,
        estado: EstadoCompra.UTILIZADA,
        mensajes: []
    }));
    assert.doesNotThrow(() => service.calificar(otroComprador.id, evento.id, 4, 'Mi experiencia'));
});
