import { ValidationError } from '../errors/ValidationError.js';

export class TipoEntrada {
    constructor({ nombre, descripcion, precio, cupo }) {
        if (!nombre || !descripcion) {
            throw new ValidationError('El tipo de entrada debe incluir el nombre y la descripción');
        }
        if (!Number.isFinite(precio) || precio <= 0) {
            throw new ValidationError('El precio debe ser un número mayor a 0');
        }
        if (!Number.isInteger(cupo) || cupo <= 0) {
            throw new ValidationError('El cupo debe ser un número entero mayor a 0');
        }

        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.cupo = cupo;
    }

    hayCupoPara(cantidad){
        return cantidad <= this.cupo;
    }
}