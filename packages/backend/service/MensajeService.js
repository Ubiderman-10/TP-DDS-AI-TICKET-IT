import { Mensaje } from '../domain/Mensaje.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { AuthorizationError } from '../errors/AuthorizationError.js';

export class MensajeService {
    constructor(mensajeRepository, compraRepository, usuarioRepository) {
        this.mensajeRepository = mensajeRepository;
        this.compraRepository = compraRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Solo participan del chat el comprador y el organizador del evento.
    validarParticipante(compra, usuario) {
        if (usuario.id !== compra.comprador.id && usuario.id !== compra.evento.organizador.id) {
            throw new AuthorizationError('Solo el comprador y el organizador pueden participar del chat');
        }
    }

    // Enviar un mensaje en el chat de una compra.
    enviar(compraId, emisorId, texto) {
        const compra = this.compraRepository.getById(compraId);
        if (!compra) {
            throw new NotFoundError('Compra no encontrada');
        }
        const emisor = this.usuarioRepository.getById(emisorId);
        if (!emisor) {
            throw new NotFoundError('Emisor no encontrado');
        }
        this.validarParticipante(compra, emisor);
        const mensaje = new Mensaje({ emisor: emisor, compra: compra, mensaje: texto });
        this.mensajeRepository.save(mensaje);
        compra.agregarMensaje(mensaje);
        return mensaje;
    }

    // Responder a un mensaje del chat.
    responder(compraId, emisorId, texto, mensajePadreId) {
        const compra = this.compraRepository.getById(compraId);
        if (!compra) {
            throw new NotFoundError('Compra no encontrada');
        }
        const emisor = this.usuarioRepository.getById(emisorId);
        if (!emisor) {
            throw new NotFoundError('Emisor no encontrado');
        }
        this.validarParticipante(compra, emisor);
        const padre = this.mensajeRepository.getById(mensajePadreId);
        if (!padre) {
            throw new NotFoundError('Mensaje a responder no encontrado');
        }
        const mensaje = new Mensaje({ emisor: emisor, compra: compra, mensaje: texto, respondeA: padre });
        this.mensajeRepository.save(mensaje);
        compra.agregarMensaje(mensaje);
        return mensaje;
    }

    getMensajesDeCompra(compraId) {
        return this.mensajeRepository.getAll().filter((m) => m.compra.id === compraId);
    }
}
