import { Usuario } from './Usuario.js'
import { Evento } from './Evento.js'

export class Reseña {
    constructor({ comprador, evento, detalle, puntuacion }) {
        if(!comprador || !(comprador instanceof Usuario)) {
            throw new Error("La persona que realiza la compra debe ser una instancia de la clase Usuario");
        }

        if(!evento || !(evento instanceof Evento)){
            throw new Error("El evento debe ser una instancia de la clase Evento");
        }

        this.comprador = comprador;
        this.evento = evento;
        this.detalle = detalle;
        this.puntuacion = puntuacion;
    }
}