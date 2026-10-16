import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de CambioEstadoCompra.
 *
 * CambioEstadoCompra: { compra, estado, quien, fechaHora }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class CambioEstadoCompraRepository extends RepositorioEnMemoriaBase {}
