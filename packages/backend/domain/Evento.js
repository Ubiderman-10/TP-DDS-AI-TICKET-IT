import { Categoria } from './Categoria.js';
import { TipoEntrada } from './TipoEntrada.js';
import { Usuario } from './Usuario.js';
import { ValidationError } from '../errors/ValidationError.js';

export class Evento {
    constructor({ nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador }) {
        if(!nombre || !descripcion) {
            throw new ValidationError('El Evento debe tener un nombre y una descripción');
        }

        if(!(categoria instanceof Categoria)) {
            throw new ValidationError('La categoría debe ser una instancia de la clase Categoria');
        }

        if(!fecha || Number.isNaN(new Date(fecha).getTime())) {
            throw new ValidationError('El Evento debe tener una fecha');
        }

        if(!Array.isArray(tiposEntrada) || tiposEntrada.some(tipo => !(tipo instanceof TipoEntrada))) {
            throw new ValidationError('Los tipos de entrada deben ser un array de instancias de la clase TipoEntrada');
        }

        if(!multimedia) {
            throw new ValidationError('El Evento debe tener multimedia');
        }

        if(!(organizador instanceof Usuario)) {
            throw new ValidationError('El organizador debe ser una instancia de la clase Usuario');
        }

        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.fecha = fecha;
        this.tiposEntrada = tiposEntrada;
        this.multimedia = multimedia;
        this.organizador = organizador;
    }

    tuPrecioEstaEntre(minimo, maximo) {
        const precios = this.tiposEntrada.map((tipo) => tipo.precio);
        if (precios.length === 0) {
            return false;
        }
        const precioMinimo = Math.min(...precios);
        return precioMinimo >= minimo && precioMinimo <= maximo;
    }

    yaOcurrio(fechaActual) {
        return this.fecha < fechaActual;
    }
}