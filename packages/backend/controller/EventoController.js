/**
 * Capa: CONTROLLER.
 * Adapta HTTP <-> EventoService: extrae parametros, llama al service
 * y responde JSON plano. Sin logica de negocio.
 * Errores -> next(err) para el middleware errorHandler.
 */
export class EventoController {
    constructor(eventoService) {
        this.eventoService = eventoService;
    }

    _usuarioResumido(u) {
        return { id: u.id, nombre: u.nombre, apellido: u.apellido };
    }

    _eventoDTO(e) {
        return {
            id: e.id,
            nombre: e.nombre,
            descripcion: e.descripcion,
            categoria: { id: e.categoria.id, nombre: e.categoria.nombre, descripcion: e.categoria.descripcion },
            fecha: e.fecha,
            multimedia: e.multimedia,
            organizador: this._usuarioResumido(e.organizador),
            tiposEntrada: e.tiposEntrada.map((t) => ({
                id: t.id,
                nombre: t.nombre,
                descripcion: t.descripcion,
                precio: t.precio,
                cupo: t.cupo
            }))
        };
    }

    // POST /eventos  body: { nombre, descripcion, fecha, multimedia, organizadorId, categoriaId, tiposEntrada? }
    crearEvento(req, res, next) {
        try {
            const evento = this.eventoService.crearEvento(
                {
                    nombre: req.body.nombre,
                    descripcion: req.body.descripcion,
                    fecha: new Date(req.body.fecha),
                    multimedia: req.body.multimedia
                },
                Number(req.body.organizadorId),
                Number(req.body.categoriaId),
                req.body.tiposEntrada || []
            );
            res.status(201).json({ data: this._eventoDTO(evento) });
        } catch (err) {
            next(err);
        }
    }

    // GET /eventos?texto=&categoriaId=&orden=precio|fecha|puntajeOrganizador
    listar(req, res, next) {
        try {
            const eventos = this.eventoService.buscar({
                texto: req.query.texto,
                categoriaId: req.query.categoriaId !== undefined ? Number(req.query.categoriaId) : undefined
            });
            const resultado = req.query.orden
                ? this.eventoService.ordenarPor(eventos, req.query.orden)
                : eventos;
            res.status(200).json({ data: resultado.map((e) => this._eventoDTO(e)) });
        } catch (err) {
            next(err);
        }
    }

    // GET /organizadores/:organizadorId/eventos
    getEventosOrganizador(req, res, next) {
        try {
            const eventos = this.eventoService.getEventosOrganizador(Number(req.params.organizadorId));
            res.status(200).json({ data: eventos.map((e) => this._eventoDTO(e)) });
        } catch (err) {
            next(err);
        }
    }

    // GET /organizadores/:organizadorId/puntaje
    puntajeOrganizador(req, res, next) {
        try {
            const puntaje = this.eventoService.puntajeOrganizador(Number(req.params.organizadorId));
            res.status(200).json({ data: { organizadorId: Number(req.params.organizadorId), puntaje } });
        } catch (err) {
            next(err);
        }
    }
}
