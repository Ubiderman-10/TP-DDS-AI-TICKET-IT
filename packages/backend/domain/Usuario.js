import { ValidationError } from '../errors/ValidationError.js';
import { RolUsuario } from './RolUsuario.js';

export class Usuario {
    constructor({ nombre, apellido, rol = RolUsuario.AMBOS }) {
        if(!nombre || !apellido){
            throw new ValidationError("El nombre y el apellido son obligatorios");
        }
        if(!Object.values(RolUsuario).includes(rol)){
            throw new ValidationError("El rol debe ser ORGANIZADOR, COMPRADOR o AMBOS");
        }

        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
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