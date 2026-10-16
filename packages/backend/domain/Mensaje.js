import { Usuario } from './Usuario.js'

export class Mensaje {
    constructor({ usuario, mensaje, enviado = new Date() }) {
        if(!usuario || !(usuario instanceof Usuario)){
            throw new Error("El usuario debe ser una instancia de la clase Usuario");
        }

        if(!mensaje){
            throw new Error("Es necesario enviar un mensaje de tipo String");
        }

        this.usuario = usuario;
        this.mensaje = mensaje;
        this.enviado = enviado;
    }
}