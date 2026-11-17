import { Router } from 'express';

export function createCompraRouter(compraController, mensajeController) {
    const router = Router();

    router.post('/', (req, res, next) => compraController.comprar(req, res, next));
    router.put('/:compraId/confirmar', (req, res, next) => compraController.confirmar(req, res, next));
    router.put('/:compraId/utilizar', (req, res, next) => compraController.marcarUtilizada(req, res, next));
    router.put('/:compraId/cancelar', (req, res, next) => compraController.cancelar(req, res, next));
    router.put('/:compraId/cancelar-y-reembolsar', (req, res, next) => compraController.cancelarYReembolsar(req, res, next));
    router.put('/:compraId/reembolsar', (req, res, next) => compraController.reembolsar(req, res, next));
    router.post('/:compraId/mensajes', (req, res, next) => mensajeController.enviar(req, res, next));
    router.post('/:compraId/mensajes/responder', (req, res, next) => mensajeController.responder(req, res, next));
    router.get('/:compraId/mensajes', (req, res, next) => mensajeController.getMensajesDeCompra(req, res, next));

    return router;
}
