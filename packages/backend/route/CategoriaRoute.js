import { Router } from 'express';

export function createCategoriaRouter(categoriaController) {
    const router = Router();

    router.get('/', (req, res, next) => categoriaController.listar(req, res, next));
    router.post('/', (req, res, next) => categoriaController.crear(req, res, next));

    return router;
}
