import { Usuario } from './Usuario.js'
import { ValidationError } from '../errors/ValidationError.js';
import { Compra } from './Compra.js';

export class Mensaje {
    constructor({ emisor, compra, mensaje, enviado = new Date(), respondeA }) {
        if(!emisor || !(emisor instanceof Usuario)){
            throw new ValidationError("El emisor debe ser una instancia de la clase Usuario");
        }

        if(!compra || !(compra instanceof Compra)) {
            throw new ValidationError("La compra debe ser una instancia de la clase Compra");
        }

        if(!mensaje){
            throw new ValidationError("Es necesario enviar un mensaje de tipo String");
        }

        if(respondeA !== undefined && respondeA !== null && !(respondeA instanceof Mensaje)) {
            throw new ValidationError("La respuesta debe ser una instancia de la clase Mensaje");
        }

        this.emisor = emisor;
        this.compra = compra;
        this.mensaje = mensaje;
        this.enviado = enviado;
        this.respondeA = respondeA;
    }
}