import { Reseña } from '../domain/Reseña.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { BusinessRuleError } from '../errors/BusinessRuleError.js';

export class ReseñaService {
    constructor(resenaRepository, compraRepository, eventoRepository, usuarioRepository) {
        this.resenaRepository = resenaRepository;
        this.compraRepository = compraRepository;
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Calificar un evento (solo si el comprador utilizo su entrada).
    calificar(compradorId, eventoId, puntuacion, detalle) {
        const comprador = this.usuarioRepository.getById(compradorId);
        if (!comprador) {
            throw new NotFoundError('Comprador no encontrado');
        }
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        const utilizoEntrada = this.compraRepository
            .getAll()
            .some(
                (c) =>
                    c.comprador.id === compradorId && c.evento.id === eventoId && c.estado === EstadoCompra.UTILIZADA
            );
        if (!utilizoEntrada) {
            throw new BusinessRuleError('Solo se puede calificar una vez utilizada la entrada');
        }
        const resena = new Reseña({ comprador: comprador, evento: evento, puntuacion: puntuacion, detalle: detalle });
        this.resenaRepository.save(resena);
        return resena;
    }

    // Ver reseñas de un evento.
    getResenasDeEvento(eventoId) {
        return this.resenaRepository.getAll().filter((r) => r.evento.id === eventoId);
    }

    // Puntaje promedio de un organizador.
    getPuntajeOrganizador(organizadorId) {
        const idsEventos = this.eventoRepository
            .getAll()
            .filter((e) => e.organizador.id === organizadorId)
            .map((e) => e.id);
        const resenas = this.resenaRepository.getAll().filter((r) => idsEventos.includes(r.evento.id));
        if (resenas.length === 0) {
            return 0;
        }
        return resenas.reduce((s, r) => s + r.puntuacion, 0) / resenas.length;
    }
}
