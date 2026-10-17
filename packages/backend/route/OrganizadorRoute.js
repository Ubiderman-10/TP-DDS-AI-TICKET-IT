import { Router } from 'express';

export function createOrganizadorRouter(eventoController, resenaController) {
    const router = Router();

    router.get('/:organizadorId/eventos', (req, res, next) => eventoController.getEventosOrganizador(req, res, next));
    router.get('/:organizadorId/puntaje', (req, res, next) => resenaController.getPuntajeOrganizador(req, res, next));

    return router;
}
