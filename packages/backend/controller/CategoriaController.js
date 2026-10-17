export class CategoriaController {
    constructor(categoriaService) {
        this.categoriaService = categoriaService;
    }

    _categoriaDTO(c) {
        return {
            id: c.id,
            nombre: c.nombre,
            descripcion: c.descripcion
        };
    }

    // GET /categorias
    listar(req, res, next) {
        try {
            const categorias = this.categoriaService.listar();
            res.status(200).json({ data: categorias.map((c) => this._categoriaDTO(c)) });
        } catch (err) {
            next(err);
        }
    }

    // POST /categorias  body: { nombre, descripcion }
    crear(req, res, next) {
        try {
            const categoria = this.categoriaService.crear({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion
            });
            res.status(201).json({ data: this._categoriaDTO(categoria) });
        } catch (err) {
            next(err);
        }
    }
}
