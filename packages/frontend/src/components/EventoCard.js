import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ui, colores } from '../theme';

export default function EventoCard({ evento, onPress, esFavorito, onToggleFavorito }) {
  const precios = (evento.tiposEntrada || []).map((t) => t.precio);
  const precioMinimo = precios.length ? Math.min(...precios) : null;

  return (
    <TouchableOpacity style={ui.card} onPress={onPress}>
      <View style={[ui.fila, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
        <Text style={[ui.titulo, { flex: 1 }]}>{evento.nombre}</Text>
        {onToggleFavorito && (
          <TouchableOpacity onPress={onToggleFavorito} hitSlop={10}>
            <Text style={{ fontSize: 26, color: esFavorito ? '#ef4444' : '#9ca3af' }}>{esFavorito ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={ui.texto}>{evento.categoria?.nombre || 'Sin categoría'}</Text>
      <Text style={ui.texto}>{new Date(evento.fecha).toLocaleDateString()}</Text>
      <Text style={[ui.texto, { color: colores.primario, fontWeight: '600' }]}>
        {precioMinimo !== null ? `Desde $${precioMinimo}` : 'Sin entradas'}
      </Text>
    </TouchableOpacity>
  );
}