import { api } from './api';

// Todas las respuestas del backend vienen como { data: ... }
const data = (promesa) => promesa.then((r) => r.data.data);

export const usuariosService = {
  listar: () => data(api.get('/usuarios')),
  obtener: (id) => data(api.get(`/usuarios/${id}`)),
  agregarFavorito: (usuarioId, eventoId) => data(api.post(`/usuarios/${usuarioId}/favoritos`, { eventoId })),
  quitarFavorito: (usuarioId, eventoId) => data(api.delete(`/usuarios/${usuarioId}/favoritos/${eventoId}`)),
};

export const categoriasService = {
  listar: () => data(api.get('/categorias')),
  crear: (nombre, descripcion) => data(api.post('/categorias', { nombre, descripcion })),
};

export const eventosService = {
  // params: { texto, categoriaId, orden: 'precio' | 'fecha' | 'puntajeOrganizador' }
  listar: (params = {}) => data(api.get('/eventos', { params })),
  obtener: (id) => data(api.get(`/eventos/${id}`)),
  crear: (datos) => data(api.post('/eventos', datos)),
};

export const organizadoresService = {
  eventos: (organizadorId) => data(api.get(`/organizadores/${organizadorId}/eventos`)),
};

export const tiposEntradaService = {
  disponibilidad: (tipoEntradaId) => data(api.get(`/tipos-entrada/${tipoEntradaId}/disponibilidad`)),
};

export const comprasService = {
  crear: ({ compradorId, eventoId, tipoEntradaId, cantidad }) =>
    data(api.post('/compras', { compradorId, eventoId, tipoEntradaId, cantidad })),
  listarPorUsuario: (usuarioId) => data(api.get(`/usuarios/${usuarioId}/compras`)),
  listarPorEvento: (eventoId) => data(api.get(`/eventos/${eventoId}/compras`)),
  confirmar: (id, usuarioId) => data(api.put(`/compras/${id}/confirmar`, { usuarioId })),
  utilizar: (id, usuarioId) => data(api.put(`/compras/${id}/utilizar`, { usuarioId })),
  cancelar: (id, usuarioId) => data(api.put(`/compras/${id}/cancelar`, { usuarioId })),
  reembolsar: (id, usuarioId) => data(api.put(`/compras/${id}/reembolsar`, { usuarioId })),
};

export const mensajesService = {
  obtener: (compraId) => data(api.get(`/compras/${compraId}/mensajes`)),
  enviar: (compraId, emisorId, texto) => data(api.post(`/compras/${compraId}/mensajes`, { emisorId, texto })),
};

export const resenasService = {
  obtener: (eventoId) => data(api.get(`/eventos/${eventoId}/resenas`)),
  calificar: (eventoId, compradorId, puntuacion, detalle) =>
    data(api.post(`/eventos/${eventoId}/resenas`, { compradorId, puntuacion, detalle })),
  puntajeOrganizador: (organizadorId) => data(api.get(`/organizadores/${organizadorId}/puntaje`)),
};