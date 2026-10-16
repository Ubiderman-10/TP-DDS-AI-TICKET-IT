import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de TipoEntrada.
 *
 * TipoEntrada: { nombre, descripcion, precio, cupo }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class TipoEntradaRepository extends RepositorioEnMemoriaBase {}
