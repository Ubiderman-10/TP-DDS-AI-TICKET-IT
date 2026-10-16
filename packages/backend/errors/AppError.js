/**
 * Clase base de errores de la aplicacion.
 * Lleva un codigo HTTP y un codigo interno para armar la respuesta JSON.
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
    }
}
