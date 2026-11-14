import { StyleSheet } from 'react-native';

export const colores = {
  primario: '#2563eb',
  texto: '#1f2937',
  textoSuave: '#6b7280',
  fondo: '#f3f4f6',
  blanco: '#ffffff',
  peligro: '#ef4444',
  ok: '#10b981',
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
  [ESTADO.PENDIENTE]: '#f59e0b',
  [ESTADO.CONFIRMADA]: '#10b981',
  [ESTADO.UTILIZADA]: '#3b82f6',
  [ESTADO.CANCELADA]: '#ef4444',
  [ESTADO.REEMBOLSADA]: '#8b5cf6',
};

export const ui = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { padding: 12 },
  card: { backgroundColor: colores.blanco, borderRadius: 12, padding: 16, marginBottom: 12 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: colores.texto },
  subtitulo: { fontSize: 16, fontWeight: 'bold', color: colores.texto, marginTop: 16, marginBottom: 8 },
  texto: { fontSize: 14, color: colores.textoSuave, marginTop: 2 },
  input: { backgroundColor: colores.fondo, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colores.texto },
  boton: { backgroundColor: colores.primario, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  botonChico: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colores.primario, marginRight: 8, marginTop: 8 },
  botonPeligro: { backgroundColor: colores.peligro },
  botonOk: { backgroundColor: colores.ok },
  botonTexto: { color: colores.blanco, fontSize: 14, fontWeight: '600' },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: colores.blanco, marginRight: 8 },
  chipActivo: { backgroundColor: colores.primario },
  chipTexto: { fontSize: 13, color: colores.texto },
  chipTextoActivo: { color: colores.blanco, fontWeight: '600' },
});