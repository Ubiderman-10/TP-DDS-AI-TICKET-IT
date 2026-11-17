export class CompraController {
    constructor(compraService) {
        this.compraService = compraService;
    }

    _usuarioResumido(u) {
        return { id: u.id, nombre: u.nombre, apellido: u.apellido };
    }

    _eventoResumido(e) {
        return { id: e.id, nombre: e.nombre, fecha: e.fecha };
    }

    _tipoResumido(t) {
        return { id: t.id, nombre: t.nombre, precio: t.precio, cupo: t.cupo };
    }

    _compraDTO(c) {
        return {
            id: c.id,
            comprador: this._usuarioResumido(c.comprador),
            evento: this._eventoResumido(c.evento),
            tipoEntrada: this._tipoResumido(c.tipoEntrada),
            cantidad: c.cantidad,
            total: c.total,
            estado: c.estado
        };
    }

    // POST /compras  body: { compradorId, eventoId, tipoEntradaId, cantidad }
    comprar(req, res, next) {
        try {
            const compra = this.compraService.comprar(
                Number(req.body.compradorId),
                Number(req.body.eventoId),
                Number(req.body.tipoEntradaId),
                Number(req.body.cantidad)
            );
            res.status(201).json({ data: this._compraDTO(compra) });
        } catch (err) {
            next(err);
        }
    }

    // PUT /compras/:compraId/confirmar  body: { usuarioId }
    confirmar(req, res, next) {
        try {
            const compra = this.compraService.confirmar(
                Number(req.params.compraId),
                Number(req.body.usuarioId)
            );
            res.status(200).json({ data: this._compraDTO(compra) });
        } catch (err) {
            next(err);
        }
    }

    // PUT /compras/:compraId/utilizar  body: { usuarioId }
    marcarUtilizada(req, res, next) {
        try {
            const compra = this.compraService.marcarUtilizada(
                Number(req.params.compraId),
                Number(req.body.usuarioId)
            );
            res.status(200).json({ data: this._compraDTO(compra) });
        } catch (err) {
            next(err);
        }
    }

    // PUT /compras/:compraId/cancelar  body: { usuarioId }
    cancelar(req, res, next) {
        try {
            const compra = this.compraService.cancelar(
                Number(req.params.compraId),
                Number(req.body.usuarioId)
            );
            res.status(200).json({ data: this._compraDTO(compra) });
        } catch (err) {
            next(err);
        }
    }

    // PUT /compras/:compraId/cancelar-y-reembolsar  body: { usuarioId }
    cancelarYReembolsar(req, res, next) {
        try {
            const compra = this.compraService.cancelarYReembolsar(
                Number(req.params.compraId),
                Number(req.body.usuarioId)
            );
            res.status(200).json({ data: this._compraDTO(compra) });
        } catch (err) {
            next(err);
        }
    }

    // PUT /compras/:compraId/reembolsar  body: { usuarioId }
    reembolsar(req, res, next) {
        try {
            const compra = this.compraService.reembolsar(
                Number(req.params.compraId),
                Number(req.body.usuarioId)
            );
            res.status(200).json({ data: this._compraDTO(compra) });
        } catch (err) {
            next(err);
        }
    }

    // GET /usuarios/:usuarioId/compras
    getComprasDelUsuario(req, res, next) {
        try {
            const data = this.compraService.getComprasDelUsuario(Number(req.params.usuarioId));
            res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }

    // GET /eventos/:eventoId/compras  -> { compras, disponibilidad }
    getComprasDeEvento(req, res, next) {
        try {
            const data = this.compraService.getComprasDeEvento(Number(req.params.eventoId));
            res.status(200).json({ data });
        } catch (err) {
            next(err);
        }
    }

    // GET /tipos-entrada/:tipoEntradaId/disponibilidad
    disponibilidad(req, res, next) {
        try {
            const disponibles = this.compraService.disponibilidad(Number(req.params.tipoEntradaId));
            res.status(200).json({ data: { tipoEntradaId: Number(req.params.tipoEntradaId), disponibles } });
        } catch (err) {
            next(err);
        }
    }
}
