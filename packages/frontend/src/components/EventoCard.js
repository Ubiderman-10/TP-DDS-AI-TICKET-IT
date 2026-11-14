import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IconButton from './IconButton';
import { ui, colores, visualCategoria, formatearFecha, formatearPrecio } from '../theme';

export default function EventoCard({ evento, onPress, esFavorito, onToggleFavorito, children }) {
  const precios = (evento.tiposEntrada || []).map((t) => t.precio);
  const precioMinimo = precios.length ? Math.min(...precios) : null;
  const visual = visualCategoria(evento.categoria?.nombre);

  return (
    <TouchableOpacity style={[ui.card, { padding: 0, overflow: 'hidden' }]} onPress={onPress} activeOpacity={0.85}>
      <View style={{ backgroundColor: visual.color, height: 92, justifyContent: 'center', paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 44 }}>{visual.emoji}</Text>
        <Text style={{ position: 'absolute', right: 16, bottom: 10, color: '#ffffffcc', fontWeight: '700', fontSize: 12 }}>
          {evento.categoria?.nombre || 'Sin categoría'}
        </Text>
        {onToggleFavorito && (
          <IconButton
            icono={esFavorito ? 'heart' : 'heart-outline'}
            etiqueta={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            color={esFavorito ? colores.peligro : colores.textoSuave}
            size={20}
            onPress={onToggleFavorito}
            style={{ position: 'absolute', top: 10, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffffee', alignItems: 'center', justifyContent: 'center' }}
          />
        )}
      </View>

      <View style={{ padding: 14 }}>
        <Text style={ui.titulo} numberOfLines={1}>{evento.nombre}</Text>
        <View style={[ui.fila, { marginTop: 6 }]}>
          <Ionicons name="calendar-outline" size={14} color={colores.textoSuave} />
          <Text style={[ui.texto, { marginTop: 0, marginLeft: 4 }]}>{formatearFecha(evento.fecha)}</Text>
        </View>
        <View style={[ui.fila, { justifyContent: 'space-between', flexWrap: 'nowrap', marginTop: 10 }]}>
          <Text style={[ui.texto, { marginTop: 0, flex: 1 }]} numberOfLines={1}>
            {evento.organizador ? `Organiza ${evento.organizador.nombre}` : ''}
          </Text>
          <View style={{ backgroundColor: colores.primarioClaro, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ color: colores.primario, fontWeight: '800', fontSize: 13 }}>
              {precioMinimo !== null ? `Desde ${formatearPrecio(precioMinimo)}` : 'Sin entradas'}
            </Text>
          </View>
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
}