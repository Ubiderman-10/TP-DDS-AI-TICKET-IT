import { ValidationError } from '../errors/ValidationError.js';

export class Usuario {
    constructor({ nombre, apellido }) {
        if(!nombre || !apellido){
            throw new ValidationError("El nombre y el apellido son obligatorios");
        }

        this.nombre = nombre;
        this.apellido = apellido;
        this.favoritos = [];
    }

    agregarFavorito(evento){
        if (!this.favoritos.includes(evento)) {
            this.favoritos.push(evento);
        }
    }

    removerFavorito(evento){
        this.favoritos = this.favoritos.filter((favorito) => favorito !== evento);
    }
}