import { Compra } from './Compra.js';
import { Usuario } from './Usuario.js';
import { EstadoCompra } from './EstadoCompra.js';

export class CambioEstadoCompra {
    constructor({ compra, estado, quien, fechaHora }) {
        if (!(compra instanceof Compra)) {
            throw new Error('La compra debe ser una instancia de la clase Compra');
        }

        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new Error(`El estado debe ser uno de los siguientes: ${Object.values(EstadoCompra).join(', ')}`);
        }

        if (!quien || !(quien instanceof Usuario)) {
            throw new Error('La persona que realiza el cambio debe ser una instancia de la clase Usuario');
        }

        if (!fechaHora) {
            throw new Error('La fecha y hora del cambio son requeridas');
        }

        this.compra = compra;
        this.estado = estado;
        this.quien = quien;
        this.fechaHora = fechaHora;
    }
}