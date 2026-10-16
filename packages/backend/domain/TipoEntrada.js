import { ValidationError } from '../errors/ValidationError.js';

export class TipoEntrada {
    constructor({ nombre, descripcion, precio, cupo }) {
        if(!nombre || !descripcion || !precio || !cupo) {
            throw new ValidationError("El tipo de entrada debe incluir el nombre, descripcion, precio y el cupo");
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