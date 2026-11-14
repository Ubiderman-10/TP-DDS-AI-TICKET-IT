import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui, colores, formatearPrecio } from '../theme';

export default function TipoEntradaCard({ tipo, disponibles, seleccionado, cantidad, onSeleccionar, onCantidadCambio }) {
  const agotado = disponibles === 0;
  const pocas = disponibles !== undefined && disponibles > 0 && disponibles <= 5;

  return (
    <TouchableOpacity
      style={[ui.card, { borderWidth: 2, borderColor: seleccionado ? colores.primario : 'transparent' }, agotado && { opacity: 0.5 }]}
      onPress={onSeleccionar}
      disabled={agotado}
      activeOpacity={0.85}
    >
      <View style={[ui.fila, { flexWrap: 'nowrap' }]}>
        <Ionicons name={seleccionado ? 'radio-button-on' : 'radio-button-off'} size={22} color={seleccionado ? colores.primario : '#9ca3af'} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[ui.titulo, { fontSize: 17 }]}>{tipo.nombre}</Text>
          <Text style={ui.texto}>{tipo.descripcion}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colores.primario }}>{formatearPrecio(tipo.precio)}</Text>
      </View>

      <Text style={{ marginTop: 10, fontSize: 13, fontWeight: '600', color: agotado ? colores.peligro : pocas ? colores.acento : colores.ok }}>
        {disponibles === undefined ? 'Cargando disponibilidad...' : agotado ? 'Agotado' : pocas ? `¡Últimas ${disponibles}!` : `${disponibles} de ${tipo.cupo} disponibles`}
      </Text>

      {seleccionado && (
        <View style={[ui.fila, { marginTop: 12, justifyContent: 'center' }]}>
          <TouchableOpacity
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colores.primarioClaro, alignItems: 'center', justifyContent: 'center', opacity: cantidad <= 1 ? 0.4 : 1 }}
            onPress={() => onCantidadCambio(cantidad - 1)}
            disabled={cantidad <= 1}
          >
            <Ionicons name="remove" size={20} color={colores.primario} />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colores.texto, marginHorizontal: 22 }}>{cantidad}</Text>
          <TouchableOpacity
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colores.primarioClaro, alignItems: 'center', justifyContent: 'center', opacity: cantidad >= disponibles ? 0.4 : 1 }}
            onPress={() => onCantidadCambio(cantidad + 1)}
            disabled={cantidad >= disponibles}
          >
            <Ionicons name="add" size={20} color={colores.primario} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}