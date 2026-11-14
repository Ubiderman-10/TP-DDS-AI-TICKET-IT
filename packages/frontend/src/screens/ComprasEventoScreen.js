import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { comprasService } from '../services/events';
import { getUsuario } from '../session';
import { ESTADO, colorEstado, ui } from '../theme';

// Vista del organizador: compras de un evento + entradas disponibles por tipo.
export default function ComprasEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const usuario = getUsuario();
  const [datos, setDatos] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setDatos(await comprasService.listarPorEvento(eventoId));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [eventoId]);

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
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={ui.pantalla} contentContainerStyle={ui.lista}>
      <Text style={ui.subtitulo}>Entradas disponibles</Text>
      <View style={ui.card}>
        {datos.disponibilidad.map((d) => (
          <Text key={d.tipoEntradaId} style={ui.texto}>{`${d.nombre}: ${d.disponibles} disponibles`}</Text>
        ))}
      </View>

      <Text style={ui.subtitulo}>Compras</Text>
      {datos.compras.length === 0 && <Text style={ui.texto}>Todavía no hay compras.</Text>}
      {datos.compras.map((c) => (
        <View key={c.id} style={ui.card}>
          <View style={[ui.fila, { justifyContent: 'space-between' }]}>
            <Text style={{ fontWeight: '600' }}>{`${c.comprador.nombre} ${c.comprador.apellido}`}</Text>
            <Text style={{ fontWeight: '700', color: colorEstado[c.estado] }}>{c.estado}</Text>
          </View>
          <Text style={ui.texto}>{`${c.tipoEntrada.nombre} x ${c.cantidad} - $${c.total}`}</Text>
          <View style={ui.fila}>
            {c.estado === ESTADO.PENDIENTE && (
              <TouchableOpacity style={[ui.botonChico, ui.botonOk]} onPress={() => ejecutar(() => comprasService.confirmar(c.id, usuario.id))}>
                <Text style={ui.botonTexto}>Confirmar pago</Text>
              </TouchableOpacity>
            )}
            {c.estado === ESTADO.CONFIRMADA && (
              <TouchableOpacity style={[ui.botonChico, ui.botonOk]} onPress={() => ejecutar(() => comprasService.utilizar(c.id, usuario.id))}>
                <Text style={ui.botonTexto}>Marcar utilizada</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={ui.botonChico} onPress={() => navigation.navigate('ChatCompra', { compraId: c.id })}>
              <Text style={ui.botonTexto}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}