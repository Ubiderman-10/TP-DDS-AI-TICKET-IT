import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { comprasService, eventosService } from '../services/events';
import { getUsuario } from '../session';
import EstadoBadge from '../components/EstadoBadge';
import Avatar from '../components/Avatar';
import Vacio from '../components/Vacio';
import { ESTADO, ui, colores, formatearPrecio } from '../theme';

function Boton({ icono, texto, onPress, estilo }) {
  return (
    <TouchableOpacity style={[ui.botonChico, estilo]} onPress={onPress}>
      <Ionicons name={icono} size={16} color="#fff" />
      <Text style={[ui.botonTexto, { marginLeft: 6 }]}>{texto}</Text>
    </TouchableOpacity>
  );
}

// Vista del organizador: compras de un evento + entradas disponibles por tipo.
export default function ComprasEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const usuario = getUsuario();
  const [datos, setDatos] = useState(null);
  const [fechaEvento, setFechaEvento] = useState(null);
  const [ahora, setAhora] = useState(Date.now());

  const cargar = useCallback(async () => {
    try {
      const [compras, evento] = await Promise.all([
        comprasService.listarPorEvento(eventoId),
        eventosService.obtener(eventoId),
      ]);
      setDatos(compras);
      setFechaEvento(evento.fecha);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [eventoId]);

  useEffect(() => {
    const timer = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const ejecutar = async (accion) => {
    try {
      await accion();
      await cargar();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!datos) {
    return (
      <View style={ui.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const puedeMarcarUtilizada = fechaEvento && new Date(fechaEvento).getTime() <= ahora;

  return (
    <ScrollView style={ui.pantalla} contentContainerStyle={ui.lista}>
      <Text style={[ui.subtitulo, { marginTop: 0 }]}>Entradas disponibles</Text>
      <View style={ui.card}>
        {datos.disponibilidad.map((d, i) => (
          <View key={d.tipoEntradaId} style={[ui.fila, { justifyContent: 'space-between', flexWrap: 'nowrap', paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderTopColor: colores.borde }]}>
            <Text style={{ fontWeight: '700', color: colores.texto }}>{d.nombre}</Text>
            <Text style={{ fontWeight: '800', color: d.disponibles === 0 ? colores.peligro : colores.ok }}>
              {d.disponibles === 0 ? 'Agotado' : `${d.disponibles} disponibles`}
            </Text>
          </View>
        ))}
      </View>

      <Text style={ui.subtitulo}>Compras</Text>
      {datos.compras.length === 0 && <Vacio icono="receipt-outline" mensaje="Todavía no hay compras para este evento." />}
      {datos.compras.map((c) => (
        <View key={c.id} style={ui.card}>
          <View style={[ui.fila, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
            <View style={[ui.fila, { flexWrap: 'nowrap', flex: 1 }]}>
              <Avatar nombre={c.comprador.nombre} apellido={c.comprador.apellido} id={c.comprador.id} size={38} />
              <Text style={{ fontWeight: '700', color: colores.texto, marginLeft: 10, flex: 1 }} numberOfLines={1}>{`${c.comprador.nombre} ${c.comprador.apellido}`}</Text>
            </View>
            <EstadoBadge estado={c.estado} />
          </View>
          <Text style={[ui.texto, { marginTop: 10 }]}>{`${c.cantidad} x ${c.tipoEntrada.nombre} · ${formatearPrecio(c.total)}`}</Text>
          <View style={ui.fila}>
            {c.estado === ESTADO.PENDIENTE && (
              <Boton icono="card-outline" texto="Confirmar pago" estilo={ui.botonOk} onPress={() => ejecutar(() => comprasService.confirmar(c.id, usuario.id))} />
            )}
            {c.estado === ESTADO.CONFIRMADA && puedeMarcarUtilizada && (
              <Boton icono="checkmark-done" texto="Marcar utilizada" estilo={ui.botonOk} onPress={() => ejecutar(() => comprasService.utilizar(c.id, usuario.id))} />
            )}
            {c.estado === ESTADO.CONFIRMADA && !puedeMarcarUtilizada && (
              <Text style={ui.texto}>Podrás marcar la entrada como utilizada cuando llegue la fecha del evento.</Text>
            )}
            <Boton icono="chatbubbles-outline" texto="Chat" estilo={{ backgroundColor: '#475569' }} onPress={() => navigation.navigate('ChatCompra', { compraId: c.id })} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}