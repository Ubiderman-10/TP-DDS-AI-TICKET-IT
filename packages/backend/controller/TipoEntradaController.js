export class TipoEntradaController {
    constructor(tipoEntradaService) {
        this.tipoEntradaService = tipoEntradaService;
    }

    _tipoDTO(t) {
        return { id: t.id, nombre: t.nombre, descripcion: t.descripcion, precio: t.precio, cupo: t.cupo };
    }

    // POST /eventos/:eventoId/tipos-entrada  body: { nombre, descripcion, precio, cupo }
    crear(req, res, next) {
        try {
            const tipo = this.tipoEntradaService.crear(Number(req.params.eventoId), {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio: Number(req.body.precio),
                cupo: Number(req.body.cupo)
            });
            res.status(201).json({ data: this._tipoDTO(tipo) });
        } catch (err) {
            next(err);
        }
    }

    // GET /eventos/:eventoId/tipos-entrada
    getTiposDeEvento(req, res, next) {
        try {
            const tipos = this.tipoEntradaService.getTiposDeEvento(Number(req.params.eventoId));
            res.status(200).json({ data: tipos.map((t) => this._tipoDTO(t)) });
        } catch (err) {
            next(err);
        }
    }
}
