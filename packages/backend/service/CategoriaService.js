import { Categoria } from '../domain/Categoria.js';
import { ValidationError } from '../errors/ValidationError.js';

export class CategoriaService {
    constructor(categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    listar() {
        return this.categoriaRepository.getAll();
    }

    crear(datos) {
        if (!datos || !datos.nombre || !datos.descripcion) {
            throw new ValidationError('La categoria debe tener nombre y descripcion');
        }
        const existe = this.categoriaRepository.getAll().some((c) => c.nombre.trim().toLowerCase() === datos.nombre.trim().toLowerCase());
        if (existe) {
            throw new ValidationError('Ya existe una categoria con ese nombre');
        }
        const categoria = new Categoria(datos);
        this.categoriaRepository.save(categoria);
        return categoria;
    }
}
