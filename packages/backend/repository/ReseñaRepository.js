import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de Reseña.
 *
 * Reseña: { comprador, evento, detalle, puntuacion }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class ReseñaRepository extends RepositorioEnMemoriaBase {}
