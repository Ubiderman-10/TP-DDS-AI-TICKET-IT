import { Usuario } from './Usuario.js';
import { Evento } from './Evento.js';
import { TipoEntrada } from './TipoEntrada.js';
import { Mensaje } from './Mensaje.js'
import { EstadoCompra } from './EstadoCompra.js';
import { ValidationError } from '../errors/ValidationError.js';

export class Compra {
    constructor({ comprador, evento, tipoEntrada, cantidad, total, estado, mensajes }) {
        if(!comprador || !(comprador instanceof Usuario)) {
            throw new ValidationError("La persona que realiza la compra debe ser una instancia de la clase Usuario");
        }

        if(!evento || !(evento instanceof Evento)){
            throw new ValidationError("El evento debe ser una instancia de la clase Evento");
        }

        if(!tipoEntrada || !(tipoEntrada instanceof TipoEntrada)){
            throw new ValidationError("El tipo de entrada debe ser una instancia de la clase TipoEntrada");
        }

        if(!Array.isArray(mensajes) || mensajes.some(mensaje => !(mensaje instanceof Mensaje))) {
            throw new ValidationError('Los mensajes deben ser un array de instancias de la clase Mensaje');
        }

        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new ValidationError(`El estado debe ser uno de los siguientes: ${Object.values(EstadoCompra).join(', ')}`);
        }

        this.comprador = comprador;
        this.evento = evento;
        this.tipoEntrada = tipoEntrada;
        this.cantidad = cantidad;
        this.total = total;
        this.estado = estado;
        this.mensajes = mensajes;
    }

    actualizarEstado(estadoCompra){
        this.estado = estadoCompra;
    }

    puedeSerCancelada(fechaActual = new Date()) {
        const estadoCancelable = this.estado === EstadoCompra.PENDIENTE || this.estado === EstadoCompra.CONFIRMADA;
        return estadoCancelable && !this.evento.yaOcurrio(fechaActual);
    }

    agregarMensaje(mensaje) {
        this.mensajes.push(mensaje);
    }
}