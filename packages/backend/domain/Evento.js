import { Categoria } from './Categoria.js';
import { TipoEntrada } from './TipoEntrada.js';
import { Usuario } from './Usuario.js';

export class Evento {
    constructor({ nombre, descripcion, categoria, fecha, tiposEntrada, multimedia, organizador }) {
        if(!nombre || !descripcion) {
            throw new Error('El Evento debe tener un nombre y una descripción');
        }

        if(!(categoria instanceof Categoria)) {
            throw new Error('La categoría debe ser una instancia de la clase Categoria');
        }

        if(!fecha) {
            throw new Error('El Evento debe tener una fecha');
        }

        if(!Array.isArray(tiposEntrada) || tiposEntrada.some(tipo => !(tipo instanceof TipoEntrada))) {
            throw new Error('Los tipos de entrada deben ser un array de instancias de la clase TipoEntrada');
        }

        if(!multimedia) {
            throw new Error('El Evento debe tener multimedia');
        }

        if(!(organizador instanceof Usuario)) {
            throw new Error('El organizador debe ser una instancia de la clase Usuario');
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
        
    }
}