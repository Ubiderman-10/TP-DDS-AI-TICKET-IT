/**
 * Capa: CONTROLLER.
 * Adapta HTTP <-> MensajeService (chat de una compra). Sin logica de negocio.
 * Errores -> next(err) para el middleware errorHandler.
 */
export class MensajeController {
    constructor(mensajeService) {
        this.mensajeService = mensajeService;
    }

    _mensajeDTO(m) {
        return {
            id: m.id,
            emisor: { id: m.emisor.id, nombre: m.emisor.nombre, apellido: m.emisor.apellido },
            compraId: m.compra.id,
            texto: m.mensaje,
            enviado: m.enviado,
            respondeA: m.respondeA ? m.respondeA.id : null
        };
    }

    // POST /compras/:compraId/mensajes  body: { emisorId, texto }
    enviar(req, res, next) {
        try {
            const mensaje = this.mensajeService.enviar(
                Number(req.params.compraId),
                Number(req.body.emisorId),
                req.body.texto
            );
            res.status(201).json({ data: this._mensajeDTO(mensaje) });
        } catch (err) {
            next(err);
        }
    }

    // POST /compras/:compraId/mensajes/responder  body: { emisorId, texto, mensajePadreId }
    responder(req, res, next) {
        try {
            const mensaje = this.mensajeService.responder(
                Number(req.params.compraId),
                Number(req.body.emisorId),
                req.body.texto,
                Number(req.body.mensajePadreId)
            );
            res.status(201).json({ data: this._mensajeDTO(mensaje) });
        } catch (err) {
            next(err);
        }
    }

    // GET /compras/:compraId/mensajes
    getMensajesDeCompra(req, res, next) {
        try {
            const mensajes = this.mensajeService.getMensajesDeCompra(Number(req.params.compraId));
            res.status(200).json({ data: mensajes.map((m) => this._mensajeDTO(m)) });
        } catch (err) {
            next(err);
        }
    }
}
