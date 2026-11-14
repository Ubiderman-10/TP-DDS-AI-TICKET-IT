// Rol con el que opera un usuario.
// ORGANIZADOR: publica eventos y gestiona sus ventas.
// COMPRADOR: explora eventos y compra entradas.
// AMBOS: puede hacer las dos cosas (valor por defecto, compatible con el diagrama de clases).
export const RolUsuario = Object.freeze({
    ORGANIZADOR: 'ORGANIZADOR',
    COMPRADOR: 'COMPRADOR',
    AMBOS: 'AMBOS'
});

export const puedeOrganizar = (usuario) => usuario.rol === RolUsuario.ORGANIZADOR || usuario.rol === RolUsuario.AMBOS;
export const puedeComprar = (usuario) => usuario.rol === RolUsuario.COMPRADOR || usuario.rol === RolUsuario.AMBOS;