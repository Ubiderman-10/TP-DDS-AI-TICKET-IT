import { Router } from 'express';

/**
 * Rutas de usuarios y favoritos. Se monta en /usuarios.
 * Recibe los controllers ya instanciados (inyeccion desde server.js).
 */
export function createUsuarioRouter(usuarioController, compraController) {
    const router = Router();

    router.get('/:usuarioId', (req, res, next) => usuarioController.obtener(req, res, next));
    router.get('/', (req, res, next) => usuarioController.listar(req, res, next));
    router.post('/', (req, res, next) => usuarioController.crearUsuario(req, res, next));
    router.post('/:usuarioId/favoritos', (req, res, next) => usuarioController.agregarFavoritos(req, res, next));
    router.delete('/:usuarioId/favoritos/:eventoId', (req, res, next) => usuarioController.removerFavoritos(req, res, next));
    router.get('/:usuarioId/compras', (req, res, next) => compraController.getComprasDelUsuario(req, res, next));

    return router;
}
