export class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }

    _usuarioDTO(u) {
        return {
            id: u.id,
            nombre: u.nombre,
            apellido: u.apellido,
            favoritos: u.favoritos.map((e) => e.id)
        };
    }

    // POST /usuarios  body: { nombre, apellido }
    crearUsuario(req, res, next) {
        try {
            const usuario = this.usuarioService.crearUsuario({
                nombre: req.body.nombre,
                apellido: req.body.apellido
            });
            res.status(201).json({ data: this._usuarioDTO(usuario) });
        } catch (err) {
            next(err);
        }
    }

    // POST /usuarios/:usuarioId/favoritos  body: { eventoId }
    agregarFavoritos(req, res, next) {
        try {
            const usuario = this.usuarioService.agregarFavoritos(
                Number(req.params.usuarioId),
                Number(req.body.eventoId)
            );
            res.status(200).json({ data: this._usuarioDTO(usuario) });
        } catch (err) {
            next(err);
        }
    }

    // DELETE /usuarios/:usuarioId/favoritos/:eventoId
    removerFavoritos(req, res, next) {
        try {
            const usuario = this.usuarioService.removerFavoritos(
                Number(req.params.usuarioId),
                Number(req.params.eventoId)
            );
            res.status(200).json({ data: this._usuarioDTO(usuario) });
        } catch (err) {
            next(err);
        }
    }
}
