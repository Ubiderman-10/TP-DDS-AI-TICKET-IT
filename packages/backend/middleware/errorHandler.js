import { AppError } from '../errors/AppError.js';

export function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: true,
            code: err.code,
            message: err.message
        });
    }
    console.error(err);
    return res.status(500).json({
        error: true,
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
    });
}
