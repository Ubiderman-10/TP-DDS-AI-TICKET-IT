import { Router } from 'express';

/**
 * Rutas agregadas del organizador. Se monta en /organizadores.
 * Usa el puntaje basado en reseñas (ReseñaService), que es el mismo
 * calculo que EventoService.puntajeOrganizador: se expone solo una vez
 * para no duplicar el endpoint.
 */
export function createOrganizadorRouter(eventoController, resenaController) {
    const router = Router();

    router.get('/:organizadorId/eventos', (req, res, next) => eventoController.getEventosOrganizador(req, res, next));
    router.get('/:organizadorId/puntaje', (req, res, next) => resenaController.getPuntajeOrganizador(req, res, next));

    return router;
}
