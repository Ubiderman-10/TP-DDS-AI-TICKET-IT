import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { comprasService } from '../services/events';
import CompraItem from '../components/CompraItem';
import Vacio from '../components/Vacio';
import { ESTADO, ui, colores } from '../theme';
import { getUsuario } from '../session';

export default function MisComprasScreen({ navigation }) {
  const usuario = getUsuario();
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setAhora(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const cargar = useCallback(async () => {
    try {
      setCompras(await comprasService.listarPorUsuario(usuario.id));
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.id]);

  // Se recarga cada vez que la pantalla vuelve a estar en foco (después de chat, calificar, etc.)
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

  const pagar = (compra) => ejecutar(() => comprasService.confirmar(compra.id, usuario.id));

  const cancelar = (compra) => {
    const conReembolso = compra.estado === ESTADO.CONFIRMADA;
    Alert.alert(
      'Cancelar compra',
      conReembolso ? '¿Cancelar la compra y pedir el reembolso?' : '¿Cancelar la compra?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          onPress: () =>
            ejecutar(async () => {
              await comprasService.cancelar(compra.id, usuario.id);
              if (conReembolso) await comprasService.reembolsar(compra.id, usuario.id);
            }),
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={ui.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <FlatList
      style={ui.pantalla}
      data={compras}
      keyExtractor={(c) => c.id.toString()}
      contentContainerStyle={ui.lista}
      ListEmptyComponent={<Vacio icono="ticket-outline" mensaje="Todavía no tenés compras. ¡Explorá los eventos!" />}
      renderItem={({ item }) => (
        <CompraItem
          compra={item}
          ahora={ahora}
          onPagar={() => pagar(item)}
          onCancelar={() => cancelar(item)}
          onChat={() => navigation.navigate('ChatCompra', { compraId: item.id })}
          onCalificar={() => navigation.navigate('CalificarEvento', { eventoId: item.evento.id })}
        />
      )}
    />
  );
}