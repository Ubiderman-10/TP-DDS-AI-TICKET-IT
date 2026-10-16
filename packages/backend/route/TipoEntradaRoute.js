import { Router } from 'express';

/**
 * Rutas de tipos de entrada. Se monta en /tipos-entrada.
 */
export function createTipoEntradaRouter(compraController) {
    const router = Router();

    router.get('/:tipoEntradaId/disponibilidad', (req, res, next) => compraController.disponibilidad(req, res, next));

    return router;
}
