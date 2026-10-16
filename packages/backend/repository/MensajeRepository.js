import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de Mensaje.
 *
 * Mensaje: { usuario, mensaje, enviado }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class MensajeRepository extends RepositorioEnMemoriaBase {}
