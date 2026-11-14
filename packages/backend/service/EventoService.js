import { Evento } from '../domain/Evento.js';
import { TipoEntrada } from '../domain/TipoEntrada.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { AuthorizationError } from '../errors/AuthorizationError.js';
import { puedeOrganizar } from '../domain/RolUsuario.js';

export class EventoService {
    constructor(eventoRepository, categoriaRepository, usuarioRepository, resenaRepository, tipoEntradaRepository = null) {
        this.eventoRepository = eventoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.resenaRepository = resenaRepository;
        this.tipoEntradaRepository = tipoEntradaRepository;
    }

    // Crear un evento (requiere organizador y categoria existentes).
    crearEvento(datos, organizadorId, categoriaId, tiposEntrada = []) {
        const organizador = this.usuarioRepository.getById(organizadorId);
        if (!organizador) {
            throw new NotFoundError('Organizador no encontrado');
        }
        if (!puedeOrganizar(organizador)) {
            throw new AuthorizationError('Solo un organizador puede crear eventos');
        }
        const categoria = this.categoriaRepository.getById(categoriaId);
        if (!categoria) {
            throw new NotFoundError('Categoria no encontrada');
        }
        const tipos = (tiposEntrada || []).map((t) => new TipoEntrada(t));
        const evento = new Evento({ ...datos, categoria: categoria, organizador: organizador, tiposEntrada: tipos });
        // Los tipos necesitan id propio para poder comprarse (CompraService los busca por id).
        // Se guardan despues de validar el Evento para no dejar tipos huerfanos si falla.
        if (this.tipoEntradaRepository) {
            tipos.forEach((t) => this.tipoEntradaRepository.save(t));
        }
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
    // direccion: 'asc' | 'desc'. Si no se indica, precio y fecha van ascendente y el puntaje descendente.
    ordenarPor(eventos, criterio, direccion) {
        const precioMinimo = (e) => (e.tiposEntrada.length ? Math.min(...e.tiposEntrada.map((t) => t.precio)) : Infinity);
        const criterios = {
            precio: { clave: precioMinimo, defecto: 'asc' },
            fecha: { clave: (e) => new Date(e.fecha).getTime(), defecto: 'asc' },
            puntajeOrganizador: { clave: (e) => this.puntajeOrganizador(e.organizador.id), defecto: 'desc' }
        };
        const config = criterios[criterio];
        if (!config) {
            return eventos;
        }
        const sentido = direccion === 'asc' || direccion === 'desc' ? direccion : config.defecto;
        const signo = sentido === 'asc' ? 1 : -1;
        return [...eventos].sort((a, b) => {
            const x = config.clave(a);
            const y = config.clave(b);
            return x === y ? 0 : signo * (x < y ? -1 : 1);
        });
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
