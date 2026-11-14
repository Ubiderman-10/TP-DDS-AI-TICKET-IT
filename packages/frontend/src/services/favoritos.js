import { usuariosService } from './events';
import { getUsuario, actualizarUsuario } from '../session';

// Agrega o quita el evento de favoritos del usuario en sesión. Devuelve la lista de ids actualizada.
export async function alternarFavorito(eventoId) {
  const usuario = getUsuario();
  const esFavorito = (usuario.favoritos || []).includes(eventoId);
  const actualizado = esFavorito
    ? await usuariosService.quitarFavorito(usuario.id, eventoId)
    : await usuariosService.agregarFavorito(usuario.id, eventoId);
  actualizarUsuario(actualizado);
  return actualizado.favoritos;
}