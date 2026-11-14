import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ui, ESTADO, colorEstado } from '../theme';

function textoDias(dias) {
  if (dias === null || dias === undefined) return null;
  if (dias < 0) return 'El evento ya se realizó';
  if (dias === 0) return 'El evento es hoy';
  return `Faltan ${dias} día${dias === 1 ? '' : 's'} para el evento`;
}

export default function CompraItem({ compra, onPagar, onCancelar, onChat, onCalificar }) {
  const dias = textoDias(compra.diasFaltantes);

  return (
    <View style={ui.card}>
      <View style={[ui.fila, { justifyContent: 'space-between' }]}>
        <Text style={[ui.titulo, { fontSize: 18, flex: 1 }]}>{compra.evento.nombre}</Text>
        <Text style={{ fontWeight: '700', color: colorEstado[compra.estado] || '#6b7280' }}>{compra.estado}</Text>
      </View>
      <Text style={ui.texto}>{`${compra.tipoEntrada.nombre} x ${compra.cantidad}`}</Text>
      <Text style={ui.texto}>{`Total: $${compra.total}`}</Text>
      <Text style={ui.texto}>{`Fecha: ${new Date(compra.evento.fecha).toLocaleDateString()}`}</Text>
      {compra.estado === ESTADO.CONFIRMADA && dias && <Text style={[ui.texto, { fontWeight: '600' }]}>{dias}</Text>}

      <View style={ui.fila}>
        {compra.estado === ESTADO.PENDIENTE && (
          <TouchableOpacity style={[ui.botonChico, ui.botonOk]} onPress={onPagar}>
            <Text style={ui.botonTexto}>Pagar</Text>
          </TouchableOpacity>
        )}
        {(compra.estado === ESTADO.PENDIENTE || compra.estado === ESTADO.CONFIRMADA) && (
          <TouchableOpacity style={[ui.botonChico, ui.botonPeligro]} onPress={onCancelar}>
            <Text style={ui.botonTexto}>{compra.estado === ESTADO.CONFIRMADA ? 'Cancelar y reembolsar' : 'Cancelar'}</Text>
          </TouchableOpacity>
        )}
        {compra.estado === ESTADO.UTILIZADA && (
          <TouchableOpacity style={ui.botonChico} onPress={onCalificar}>
            <Text style={ui.botonTexto}>Calificar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={ui.botonChico} onPress={onChat}>
          <Text style={ui.botonTexto}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}