import { Usuario } from '../domain/Usuario.js';
import { NotFoundError } from '../errors/NotFoundError.js';

export class UsuarioService {
    constructor(usuarioRepository, eventoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
    }

    listar() {
        return this.usuarioRepository.getAll();
    }

    obtener(usuarioId) {
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        return usuario;
    }

    crearUsuario({ nombre, apellido }) {
        const usuario = new Usuario({ nombre: nombre, apellido: apellido });
        this.usuarioRepository.save(usuario);
        return usuario;
    }

    // Guardar un evento como favorito.
    agregarFavoritos(usuarioId, eventoId) {
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        usuario.agregarFavorito(evento);
        return usuario;
    }

    removerFavoritos(usuarioId, eventoId) {
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        usuario.removerFavorito(evento);
        return usuario;
    }
}
