import { Usuario } from './Usuario.js';
import { Evento } from './Evento.js';
import { TipoEntrada } from './TipoEntrada.js';
import { Mensaje } from './Mensaje.js'

export const EstadoCompra = Object.freeze({
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    UTILIZADA: 'Utilizada',
    CANCELADA: 'Cancelada',
    REEMBOLSADA: 'Reembolsada'
});

export class Compra {
    constructor({ comprador, evento, tipoEntrada, cantidad, total, estado, mensajes }) {
        if(!comprador || !(comprador instanceof Usuario)) {
            throw new Error("La persona que realiza la compra debe ser una instancia de la clase Usuario");
        }

        if(!evento || !(evento instanceof Evento)){
            throw new Error("El evento debe ser una instancia de la clase Evento");
        }

        if(!tipoEntrada || !(tipoEntrada instanceof TipoEntrada)){
            throw new Error("El tipo de entrada debe ser una instancia de la clase TipoEntrada");
        }

        if(!Array.isArray(mensajes) || mensajes.some(mensaje => !(mensaje instanceof Mensaje))) {
            throw new Error('Los mensajes deben ser un array de instancias de la clase Mensaje');
        }

        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new Error(`El estado debe ser uno de los siguientes: ${Object.values(EstadoCompra).join(', ')}`);
        }

        this.comprador = comprador;
        this.evento = evento;
        this.tipoEntrada = tipoEntrada;
        this.cantidad = cantidad;
        this.total = total;
        this.estado = estado;
    }

    actualizarEstado(estadoCompra){
        
    }
}