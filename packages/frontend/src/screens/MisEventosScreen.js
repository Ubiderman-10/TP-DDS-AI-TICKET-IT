import React, { useCallback, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { organizadoresService, comprasService, resenasService } from '../services/events';
import { getUsuario, setUsuario } from '../session';
import EventoCard from '../components/EventoCard';
import IconButton from '../components/IconButton';
import Vacio from '../components/Vacio';
import { ui, colores } from '../theme';

function Dato({ icono, texto }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colores.fondo, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 8, marginTop: 10 }}>
      <Ionicons name={icono} size={13} color={colores.textoSuave} />
      <Text style={{ marginLeft: 5, fontSize: 12, fontWeight: '600', color: colores.texto }}>{texto}</Text>
    </View>
  );
}

// Pantalla de inicio del organizador: sus propios eventos con un resumen de ventas.
export default function MisEventosScreen({ navigation }) {
  const usuario = getUsuario();
  const [eventos, setEventos] = useState([]);
  const [resumen, setResumen] = useState({}); // { [eventoId]: { compras, disponibles } }
  const [puntaje, setPuntaje] = useState(0);
  const [cargando, setCargando] = useState(true);

  const salir = () => {
    setUsuario(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icono="add-circle-outline" etiqueta="Crear evento" size={26} onPress={() => navigation.navigate('CrearEvento')} style={{ marginRight: 18 }} />
          <IconButton icono="log-out-outline" etiqueta="Cerrar sesión" onPress={salir} />
        </View>
      ),
    });
  }, [navigation]);

  const cargar = useCallback(async () => {
    try {
      const propios = await organizadoresService.eventos(usuario.id);
      setEventos(propios);
      const [datos, puntajeOrg] = await Promise.all([
        Promise.all(propios.map((e) => comprasService.listarPorEvento(e.id))),
        resenasService.puntajeOrganizador(usuario.id),
      ]);
      const mapa = {};
      propios.forEach((e, i) => {
        mapa[e.id] = {
          compras: datos[i].compras.length,
          disponibles: datos[i].disponibilidad.reduce((suma, d) => suma + d.disponibles, 0),
        };
      });
      setResumen(mapa);
      setPuntaje(puntajeOrg.puntaje);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.id]);

  // Se recarga al volver (por ejemplo después de crear un evento o confirmar una venta).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  if (cargando) {
    return (
      <View style={ui.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const totalCompras = Object.values(resumen).reduce((suma, r) => suma + r.compras, 0);

  return (
    <FlatList
      style={ui.pantalla}
      data={eventos}
      keyExtractor={(e) => e.id.toString()}
      contentContainerStyle={ui.lista}
      ListHeaderComponent={
        <View style={[ui.card, { backgroundColor: colores.primario }]}>
          <Text style={{ color: '#c7d2fe', fontSize: 13 }}>Hola, {usuario.nombre}</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 }}>Tus eventos</Text>
          <View style={[ui.fila, { marginTop: 10 }]}>
            <Dato icono="calendar-outline" texto={`${eventos.length} evento${eventos.length === 1 ? '' : 's'}`} />
            <Dato icono="receipt-outline" texto={`${totalCompras} compra${totalCompras === 1 ? '' : 's'}`} />
            <Dato icono="star" texto={puntaje > 0 ? `${puntaje.toFixed(1)} / 5` : 'Sin reseñas'} />
          </View>
        </View>
      }
      ListEmptyComponent={
        <View>
          <Vacio icono="calendar-outline" mensaje="Todavía no creaste eventos." />
          <TouchableOpacity style={[ui.boton, { marginTop: 20 }]} onPress={() => navigation.navigate('CrearEvento')}>
            <Text style={ui.botonTexto}>Crear mi primer evento</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <EventoCard evento={item} onPress={() => navigation.navigate('DetalleEvento', { id: item.id })}>
          {resumen[item.id] && (
            <View style={ui.fila}>
              <Dato icono="receipt-outline" texto={`${resumen[item.id].compras} compra${resumen[item.id].compras === 1 ? '' : 's'}`} />
              <Dato icono="ticket-outline" texto={`${resumen[item.id].disponibles} disponibles`} />
            </View>
          )}
        </EventoCard>
      )}
    />
  );
}