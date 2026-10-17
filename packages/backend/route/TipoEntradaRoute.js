import { Router } from 'express';

export function createTipoEntradaRouter(compraController) {
    const router = Router();

    router.get('/:tipoEntradaId/disponibilidad', (req, res, next) => compraController.disponibilidad(req, res, next));

    return router;
}
