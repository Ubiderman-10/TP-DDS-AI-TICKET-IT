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