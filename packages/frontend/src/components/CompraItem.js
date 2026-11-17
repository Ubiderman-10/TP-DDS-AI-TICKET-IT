import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EstadoBadge from './EstadoBadge';
import { ui, colores, ESTADO, visualCategoria, formatearFecha, formatearPrecio } from '../theme';

function textoDias(dias) {
  if (dias === null || dias === undefined) return null;
  if (dias < 0) return 'El evento ya se realizó';
  if (dias === 0) return '¡El evento es hoy!';
  return `Faltan ${dias} día${dias === 1 ? '' : 's'} para el evento`;
}

function Dato({ icono, texto }) {
  return (
    <View style={[ui.fila, { marginTop: 6 }]}>
      <Ionicons name={icono} size={15} color={colores.textoSuave} />
      <Text style={[ui.texto, { marginTop: 0, marginLeft: 6 }]}>{texto}</Text>
    </View>
  );
}

function Boton({ icono, texto, onPress, estilo }) {
  return (
    <TouchableOpacity style={[ui.botonChico, estilo]} onPress={onPress}>
      <Ionicons name={icono} size={16} color="#fff" />
      <Text style={[ui.botonTexto, { marginLeft: 6 }]}>{texto}</Text>
    </TouchableOpacity>
  );
}

export default function CompraItem({ compra, onPagar, onCancelar, onChat, onCalificar, ahora = Date.now() }) {
  const dias = textoDias(compra.diasFaltantes);
  const visual = visualCategoria(compra.evento.categoria?.nombre);
  const fechaEvento = new Date(compra.evento.fecha).getTime();
  const puedeCalificar = compra.estado === ESTADO.UTILIZADA && Number.isFinite(fechaEvento) && fechaEvento <= ahora;

  return (
    <View style={[ui.card, { borderLeftWidth: 5, borderLeftColor: visual.color }]}>
      <View style={[ui.fila, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
        <Text style={[ui.titulo, { fontSize: 17, flex: 1, marginRight: 8 }]} numberOfLines={1}>{compra.evento.nombre}</Text>
        <EstadoBadge estado={compra.estado} />
      </View>
      <Dato icono="ticket-outline" texto={`${compra.cantidad} x ${compra.tipoEntrada.nombre}`} />
      <Dato icono="cash-outline" texto={`Total ${formatearPrecio(compra.total)}`} />
      <Dato icono="calendar-outline" texto={formatearFecha(compra.evento.fecha)} />
      {compra.estado === ESTADO.CONFIRMADA && dias && (
        <View style={{ marginTop: 10, backgroundColor: '#ecfdf5', padding: 8, borderRadius: 10 }}>
          <Text style={{ color: '#047857', fontWeight: '700', fontSize: 13 }}>⏳ {dias}</Text>
        </View>
      )}

      <View style={ui.fila}>
        {compra.estado === ESTADO.PENDIENTE && <Boton icono="card-outline" texto="Pagar" onPress={onPagar} estilo={ui.botonOk} />}
        {(compra.estado === ESTADO.PENDIENTE || compra.estado === ESTADO.CONFIRMADA) && (
          <Boton icono="close-circle-outline" texto={compra.estado === ESTADO.CONFIRMADA ? 'Cancelar y reembolsar' : 'Cancelar'} onPress={onCancelar} estilo={ui.botonPeligro} />
        )}
        {puedeCalificar && <Boton icono="star-outline" texto="Calificar" onPress={onCalificar} />}
        <Boton icono="chatbubbles-outline" texto="Chat" onPress={onChat} estilo={{ backgroundColor: '#475569' }} />
      </View>
    </View>
  );
}