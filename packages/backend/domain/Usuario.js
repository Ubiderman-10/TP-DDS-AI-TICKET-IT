import { Evento } from './Evento.js'

export class Usuario {
    constructor({ nombre, apellido, favoritos }) {
        if(!nombre || !apellido){
            throw new Error("El nombre y el apellido son obligatorios");
        }

        if(!Array.isArray(favoritos) || favoritos.some(evento => !(evento instanceof Evento))){
            throw new Error('Los favoritos deben ser un array de instancias de la clase Evento');
        }

        this.nombre = nombre;
        this.apellido = apellido;
        this.favoritos = favoritos;
    }
}