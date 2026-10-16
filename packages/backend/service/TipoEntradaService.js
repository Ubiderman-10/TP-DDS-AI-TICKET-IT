import { TipoEntrada } from '../domain/TipoEntrada.js';
import { NotFoundError } from '../errors/NotFoundError.js';

export class TipoEntradaService {
    constructor(tipoEntradaRepository, eventoRepository) {
        this.tipoEntradaRepository = tipoEntradaRepository;
        this.eventoRepository = eventoRepository;
    }

    // Crear un tipo de entrada y agregarlo a su evento.
    crear(eventoId, { nombre, descripcion, precio, cupo }) {
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        const tipo = new TipoEntrada({ nombre: nombre, descripcion: descripcion, precio: precio, cupo: cupo });
        this.tipoEntradaRepository.save(tipo);
        evento.tiposEntrada.push(tipo);
        return tipo;
    }

    getTiposDeEvento(eventoId) {
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        return evento.tiposEntrada;
    }
}
