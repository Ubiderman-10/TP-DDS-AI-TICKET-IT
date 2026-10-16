import { RepositorioEnMemoriaBase } from './RepositorioEnMemoriaBase.js';

/**
 * Repositorio en memoria de Categoria.
 *
 * Categoria: { nombre, descripcion }
 *
 * El id se genera en el RepositorioEnMemoriaBase (cuando se guarda).
 */
export class CategoriaRepository extends RepositorioEnMemoriaBase {}
