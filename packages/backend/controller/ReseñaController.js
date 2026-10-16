/**
 * Capa: CONTROLLER.
 * Adapta HTTP <-> ReseñaService. Sin logica de negocio.
 * Errores -> next(err) para el middleware errorHandler.
 */
export class ReseñaController {
    constructor(resenaService) {
        this.resenaService = resenaService;
    }

    _resenaDTO(r) {
        return {
            id: r.id,
            comprador: { id: r.comprador.id, nombre: r.comprador.nombre, apellido: r.comprador.apellido },
            evento: { id: r.evento.id, nombre: r.evento.nombre },
            puntuacion: r.puntuacion,
            detalle: r.detalle
        };
    }

    // POST /eventos/:eventoId/resenas  body: { compradorId, puntuacion, detalle }
    calificar(req, res, next) {
        try {
            const resena = this.resenaService.calificar(
                Number(req.body.compradorId),
                Number(req.params.eventoId),
                Number(req.body.puntuacion),
                req.body.detalle
            );
            res.status(201).json({ data: this._resenaDTO(resena) });
        } catch (err) {
            next(err);
        }
    }

    // GET /eventos/:eventoId/resenas
    getResenasDeEvento(req, res, next) {
        try {
            const resenas = this.resenaService.getResenasDeEvento(Number(req.params.eventoId));
            res.status(200).json({ data: resenas.map((r) => this._resenaDTO(r)) });
        } catch (err) {
            next(err);
        }
    }

    // GET /organizadores/:organizadorId/puntaje
    getPuntajeOrganizador(req, res, next) {
        try {
            const puntaje = this.resenaService.getPuntajeOrganizador(Number(req.params.organizadorId));
            res.status(200).json({ data: { organizadorId: Number(req.params.organizadorId), puntaje } });
        } catch (err) {
            next(err);
        }
    }
}
