import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ui, colores } from '../theme';

export default function TipoEntradaCard({ tipo, disponibles, seleccionado, cantidad, onSeleccionar, onCantidadCambio }) {
  const agotado = disponibles === 0;

  return (
    <TouchableOpacity
      style={[ui.card, seleccionado && { borderWidth: 2, borderColor: colores.primario }, agotado && { opacity: 0.5 }]}
      onPress={onSeleccionar}
      disabled={agotado}
    >
      <Text style={ui.titulo}>{tipo.nombre}</Text>
      <Text style={ui.texto}>{tipo.descripcion}</Text>
      <Text style={ui.texto}>{`Precio: $${tipo.precio}`}</Text>
      <Text style={ui.texto}>
        {disponibles === undefined ? 'Cargando disponibilidad...' : agotado ? 'Agotado' : `Disponibles: ${disponibles} de ${tipo.cupo}`}
      </Text>

      {seleccionado && (
        <View style={[ui.fila, { marginTop: 12 }]}>
          <TouchableOpacity style={ui.botonChico} onPress={() => onCantidadCambio(cantidad - 1)} disabled={cantidad <= 1}>
            <Text style={ui.botonTexto}>-</Text>
          </TouchableOpacity>
          <Text style={[ui.titulo, { marginHorizontal: 12 }]}>{cantidad}</Text>
          <TouchableOpacity style={ui.botonChico} onPress={() => onCantidadCambio(cantidad + 1)} disabled={cantidad >= disponibles}>
            <Text style={ui.botonTexto}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}