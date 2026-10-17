import { Evento } from '../domain/Evento.js';
import { NotFoundError } from '../errors/NotFoundError.js';

export class EventoService {
    constructor(eventoRepository, categoriaRepository, usuarioRepository, resenaRepository) {
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.resenaRepository = resenaRepository;
    }

    // Crear un evento (requiere organizador y categoria existentes).
    crearEvento(datos, organizadorId, categoriaId, tiposEntrada = []) {
        const organizador = this.usuarioRepository.getById(organizadorId);
        if (!organizador) {
            throw new NotFoundError('Organizador no encontrado');
        }
        const categoria = this.categoriaRepository.getById(categoriaId);
        if (!categoria) {
            throw new NotFoundError('Categoria no encontrada');
        }
        const evento = new Evento({ ...datos, categoria: categoria, organizador: organizador, tiposEntrada });
        this.eventoRepository.save(evento);
        return evento;
    }

    // Buscar por texto (nombre/descripcion) y/o categoria.
    buscar({ texto, categoriaId } = {}) {
        let eventos = this.eventoRepository.getAll();
        if (texto) {
            const t = texto.toLowerCase();
            eventos = eventos.filter(
                (e) => e.nombre.toLowerCase().includes(t) || e.descripcion.toLowerCase().includes(t)
            );
        }
        if (categoriaId) {
            eventos = eventos.filter((e) => e.categoria.id === categoriaId);
        }
        return eventos;
    }

    // Puntaje de un organizador = promedio de puntuaciones de sus eventos.
    puntajeOrganizador(organizadorId) {
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

    // Ordenar por precio (min), fecha o puntaje del organizador.
    ordenarPor(eventos, criterio) {
        const precioMinimo = (e) => (e.tiposEntrada.length ? Math.min(...e.tiposEntrada.map((t) => t.precio)) : Infinity);
        if (criterio === 'precio') {
            return [...eventos].sort((a, b) => precioMinimo(a) - precioMinimo(b));
        }
        if (criterio === 'fecha') {
            return [...eventos].sort((a, b) => a.fecha - b.fecha);
        }
        if (criterio === 'puntajeOrganizador') {
            return [...eventos].sort(
                (a, b) => this.puntajeOrganizador(b.organizador.id) - this.puntajeOrganizador(a.organizador.id)
            );
        }
        return eventos;
    }

    // Eventos de un organizador.
    getEventosOrganizador(organizadorId) {
        return this.eventoRepository.getAll().filter((e) => e.organizador.id === organizadorId);
    }

    // Detalle de un evento por id.
    obtenerPorId(id) {
        const evento = this.eventoRepository.getById(id);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        return evento;
    }
}
