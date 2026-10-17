import { Router } from 'express';

export function createEventoRouter(eventoController, tipoEntradaController, resenaController, compraController) {
    const router = Router();

    router.post('/', (req, res, next) => eventoController.crearEvento(req, res, next));
    router.get('/', (req, res, next) => eventoController.listar(req, res, next));
    router.get('/:eventoId', (req, res, next) => eventoController.obtenerPorId(req, res, next));
    router.get('/:eventoId/compras', (req, res, next) => compraController.getComprasDeEvento(req, res, next));
    router.post('/:eventoId/tipos-entrada', (req, res, next) => tipoEntradaController.crear(req, res, next));
    router.get('/:eventoId/tipos-entrada', (req, res, next) => tipoEntradaController.getTiposDeEvento(req, res, next));
    router.post('/:eventoId/resenas', (req, res, next) => resenaController.calificar(req, res, next));
    router.get('/:eventoId/resenas', (req, res, next) => resenaController.getResenasDeEvento(req, res, next));

    return router;
}
