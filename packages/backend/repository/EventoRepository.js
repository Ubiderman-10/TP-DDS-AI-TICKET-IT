import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de Evento.
 *
 * Evento: { nombre, descripcion, categoria, fecha, tiposEntrada[], multimedia, organizador }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class EventoRepository extends RepositorioEnMemoriaBase {}
