import { Usuario } from './Usuario.js'
import { Evento } from './Evento.js'
import { ValidationError } from '../errors/ValidationError.js';

export class Reseña {
    constructor({ comprador, evento, detalle, puntuacion }) {
        if(!comprador || !(comprador instanceof Usuario)) {
            throw new ValidationError("La persona que realiza la compra debe ser una instancia de la clase Usuario");
        }

        if(!evento || !(evento instanceof Evento)){
            throw new ValidationError("El evento debe ser una instancia de la clase Evento");
        }

        if(!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
            throw new ValidationError("La puntuacion debe ser un numero entero entre 1 y 5 inclusive");
        }

        this.comprador = comprador;
        this.evento = evento;
        this.detalle = detalle;
        this.puntuacion = puntuacion;
    }
}