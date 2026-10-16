import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de Compra.
 *
 * Compra: { comprador, evento, tipoEntrada, cantidad, total, estado, mensajes[] }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class CompraRepository extends RepositorioEnMemoriaBase {}
