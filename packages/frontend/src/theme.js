import { StyleSheet } from 'react-native';

export const colores = {
  primario: '#4f46e5',
  primarioOscuro: '#3730a3',
  primarioClaro: '#eef2ff',
  texto: '#111827',
  textoSuave: '#6b7280',
  fondo: '#f5f6fa',
  blanco: '#ffffff',
  borde: '#e5e7eb',
  peligro: '#ef4444',
  ok: '#10b981',
  acento: '#f59e0b',
};

// Los valores coinciden con EstadoCompra del backend (domain/EstadoCompra.js)
export const ESTADO = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  UTILIZADA: 'Utilizada',
  CANCELADA: 'Cancelada',
  REEMBOLSADA: 'Reembolsada',
};

export const colorEstado = {
  [ESTADO.PENDIENTE]: '#d97706',
  [ESTADO.CONFIRMADA]: '#059669',
  [ESTADO.UTILIZADA]: '#2563eb',
  [ESTADO.CANCELADA]: '#dc2626',
  [ESTADO.REEMBOLSADA]: '#7c3aed',
};

export const iconoEstado = {
  [ESTADO.PENDIENTE]: 'time-outline',
  [ESTADO.CONFIRMADA]: 'checkmark-circle',
  [ESTADO.UTILIZADA]: 'ticket',
  [ESTADO.CANCELADA]: 'close-circle',
  [ESTADO.REEMBOLSADA]: 'return-down-back',
};

// Color y emoji de cada categoría (se busca por nombre; cualquier otra usa el valor por defecto).
const VISUAL_CATEGORIAS = {
  musica: { emoji: '🎵', color: '#7c3aed' },
  teatro: { emoji: '🎭', color: '#db2777' },
  humor: { emoji: '😂', color: '#f59e0b' },
  deportes: { emoji: '⚽', color: '#059669' },
  conferencias: { emoji: '🎤', color: '#0891b2' },
  gastronomia: { emoji: '🍽️', color: '#ea580c' },
  cine: { emoji: '🎬', color: '#475569' },
  danza: { emoji: '💃', color: '#e11d48' },
  infantil: { emoji: '🧸', color: '#16a34a' },
};
// Las categorías nuevas (creadas desde la app) reciben un color según su nombre.
const PALETA_CATEGORIAS = ['#4f46e5', '#0d9488', '#c026d3', '#ca8a04', '#2563eb', '#dc2626', '#65a30d'];

export function visualCategoria(nombre) {
  const clave = (nombre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (VISUAL_CATEGORIAS[clave]) return VISUAL_CATEGORIAS[clave];
  let hash = 0;
  for (const letra of clave) hash = (hash * 31 + letra.charCodeAt(0)) % 997;
  return { emoji: '🎟️', color: PALETA_CATEGORIAS[hash % PALETA_CATEGORIAS.length] };
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const dos = (n) => String(n).padStart(2, '0');

// Se arma a mano para no depender de Intl en el dispositivo.
export function formatearFecha(fecha) {
  const d = new Date(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatearFechaHora(fecha) {
  const d = new Date(fecha);
  return `${formatearFecha(d)}, ${dos(d.getHours())}:${dos(d.getMinutes())} hs`;
}

export function formatearPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-AR')}`;
}

export const sombra = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const ui = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colores.fondo },
  lista: { padding: 16 },
  card: { backgroundColor: colores.blanco, borderRadius: 16, padding: 16, marginBottom: 14, ...sombra },
  titulo: { fontSize: 20, fontWeight: '800', color: colores.texto },
  subtitulo: { fontSize: 17, fontWeight: '800', color: colores.texto, marginTop: 20, marginBottom: 10 },
  texto: { fontSize: 14, color: colores.textoSuave, marginTop: 3 },
  input: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colores.texto,
  },
  boton: { backgroundColor: colores.primario, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', ...sombra },
  botonChico: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colores.primario,
    marginRight: 8,
    marginTop: 10,
  },
  botonPeligro: { backgroundColor: colores.peligro },
  botonOk: { backgroundColor: colores.ok },
  botonTexto: { color: colores.blanco, fontSize: 14, fontWeight: '700' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    marginRight: 8,
  },
  chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
  chipTexto: { fontSize: 13, fontWeight: '600', color: colores.texto },
  chipTextoActivo: { color: colores.blanco },
});