// Sesión en memoria: el TP no pide autenticación, solo saber "quién soy".
let usuarioActual = null;

export const getUsuario = () => usuarioActual;
export const setUsuario = (usuario) => {
  usuarioActual = usuario;
};
// Actualiza campos del usuario en sesión (por ejemplo, sus favoritos).
export const actualizarUsuario = (parcial) => {
  usuarioActual = { ...usuarioActual, ...parcial };
};
// Reglas de rol (el backend las valida también): ORGANIZADOR publica eventos, COMPRADOR compra, AMBOS hace las dos cosas.
export const puedeComprar = (usuario) => !!usuario && (usuario.rol === 'COMPRADOR' || usuario.rol === 'AMBOS');
export const puedeOrganizar = (usuario) => !!usuario && (usuario.rol === 'ORGANIZADOR' || usuario.rol === 'AMBOS');