import { ValidationError } from '../errors/ValidationError.js';

export class Categoria {
    constructor({ nombre, descripcion }) {
        if(!nombre || !descripcion) {
            throw new ValidationError("La Categoria debe tener un nombre y una descripción");
        }

        this.nombre = nombre;
        this.descripcion = descripcion;
    }
}