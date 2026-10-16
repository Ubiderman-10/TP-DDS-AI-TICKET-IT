import { Usuario } from './Usuario.js'
import { Compra } from './Compra.js';

export class Mensaje {
    constructor({ emisor, compra, mensaje, enviado = new Date(), respondeA }) {
        if(!emisor || !(emisor instanceof Usuario)){
            throw new Error("El emisor debe ser una instancia de la clase Usuario");
        }

        if(!compra || !(compra instanceof Compra)) {
            throw new Error("La compra debe ser una instancia de la clase Compra");
        }

        if(!mensaje){
            throw new Error("Es necesario enviar un mensaje de tipo String");
        }

        if(respondeA !== undefined && respondeA !== null && !(respondeA instanceof Mensaje)) {
            throw new Error("La respuesta debe ser una instancia de la clase Mensaje");
        }

        this.emisor = emisor;
        this.compra = compra;
        this.mensaje = mensaje;
        this.enviado = enviado;
        this.respondeA = respondeA;
    }
}