import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de Usuario.
 *
 * Usuario: { nombre, apellido, favoritos[] }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class UsuarioRepository extends RepositorioEnMemoriaBase {}
