import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { eventosService, organizadoresService, tiposEntradaService, comprasService, resenasService } from '../services/events';
import TipoEntradaCard from '../components/TipoEntradaCard';
import { alternarFavorito } from '../services/favoritos';
import { getUsuario } from '../session';
import { ui } from '../theme';

export default function DetalleEventoScreen({ route, navigation }) {
  const { id } = route.params;
  const usuario = getUsuario();
  const [evento, setEvento] = useState(null);
  const [disponibles, setDisponibles] = useState({}); // { [tipoEntradaId]: cantidad }
  const [puntaje, setPuntaje] = useState(0);
  const [resenas, setResenas] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [esFavorito, setEsFavorito] = useState((usuario.favoritos || []).includes(id));

  const cargar = useCallback(async () => {
    try {
      const ev = await eventosService.obtener(id);
      setEvento(ev);
      setEsFavorito((getUsuario().favoritos || []).includes(ev.id));

      const [cupos, puntajeOrg, eventosOrg] = await Promise.all([
        Promise.all(ev.tiposEntrada.map((t) => tiposEntradaService.disponibilidad(t.id))),
        resenasService.puntajeOrganizador(ev.organizador.id),
        organizadoresService.eventos(ev.organizador.id),
      ]);
      const mapa = {};
      cupos.forEach((c) => {
        mapa[c.tipoEntradaId] = c.disponibles;
      });
      setDisponibles(mapa);
      setPuntaje(puntajeOrg.puntaje);

      // Reseñas de todos los eventos del organizador (use case: conocer experiencias previas)
      const listas = await Promise.all(eventosOrg.map((e) => resenasService.obtener(e.id)));
      setResenas(listas.flat());
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const toggleFavorito = async () => {
    try {
      const favoritos = await alternarFavorito(id);
      setEsFavorito(favoritos.includes(id));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const seleccionar = (tipo) => {
    setTipoSeleccionado(tipo);
    setCantidad(1);
  };

  const cambiarCantidad = (nueva) => {
    const max = disponibles[tipoSeleccionado.id] ?? 1;
    setCantidad(Math.min(Math.max(1, nueva), max));
  };

  const comprar = async () => {
    if (!tipoSeleccionado) {
      Alert.alert('Atención', 'Seleccioná un tipo de entrada');
      return;
    }
    setComprando(true);
    try {
      await comprasService.crear({
        compradorId: usuario.id,
        eventoId: evento.id,
        tipoEntradaId: tipoSeleccionado.id,
        cantidad,
      });
      Alert.alert('Compra realizada', 'Quedó pendiente de pago. Podés pagarla desde Mis compras.');
      setTipoSeleccionado(null);
      navigation.navigate('MisCompras');
    } catch (error) {
      Alert.alert('No se pudo comprar', error.message);
    } finally {
      setComprando(false);
    }
  };

  if (cargando || !evento) {
    return (
      <View style={ui.centro}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const esOrganizador = usuario && evento.organizador.id === usuario.id;

  return (
    <ScrollView style={ui.pantalla} contentContainerStyle={ui.lista}>
      <View style={ui.card}>
        <View style={[ui.fila, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
          <Text style={[ui.titulo, { flex: 1 }]}>{evento.nombre}</Text>
          <TouchableOpacity onPress={toggleFavorito} hitSlop={10}>
            <Text style={{ fontSize: 28, color: esFavorito ? '#ef4444' : '#9ca3af' }}>{esFavorito ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={ui.texto}>{evento.descripcion}</Text>
        <Text style={ui.texto}>{`Fecha: ${new Date(evento.fecha).toLocaleString()}`}</Text>
        <Text style={ui.texto}>{`Organiza: ${evento.organizador.nombre} ${evento.organizador.apellido}`}</Text>
        <Text style={ui.texto}>{puntaje > 0 ? `Puntaje del organizador: ${puntaje.toFixed(1)} / 5` : 'Organizador sin reseñas todavía'}</Text>
      </View>

      {esOrganizador && (
        <Text style={[ui.texto, { marginBottom: 8 }]}>Sos el organizador de este evento: no podés comprar sus entradas.</Text>
      )}
      {esOrganizador && (
        <TouchableOpacity style={ui.boton} onPress={() => navigation.navigate('ComprasEvento', { eventoId: evento.id })}>
          <Text style={ui.botonTexto}>Ver ventas de este evento</Text>
        </TouchableOpacity>
      )}

      <Text style={ui.subtitulo}>Tipos de entrada</Text>
      {evento.tiposEntrada.length === 0 && <Text style={ui.texto}>Este evento todavía no tiene entradas.</Text>}
      {evento.tiposEntrada.map((tipo) => (
        <TipoEntradaCard
          key={tipo.id}
          tipo={tipo}
          disponibles={disponibles[tipo.id]}
          seleccionado={tipoSeleccionado?.id === tipo.id}
          cantidad={cantidad}
          onSeleccionar={() => !esOrganizador && seleccionar(tipo)}
          onCantidadCambio={cambiarCantidad}
        />
      ))}

      {!esOrganizador && (
        <TouchableOpacity style={[ui.boton, (!tipoSeleccionado || comprando) && { opacity: 0.5 }]} onPress={comprar} disabled={!tipoSeleccionado || comprando}>
          <Text style={ui.botonTexto}>
            {comprando ? 'Procesando...' : tipoSeleccionado ? `Comprar ${cantidad} x ${tipoSeleccionado.nombre} ($${tipoSeleccionado.precio * cantidad})` : 'Comprar entradas'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={ui.subtitulo}>Reseñas del organizador</Text>
      {resenas.length === 0 && <Text style={ui.texto}>Todavía no hay reseñas.</Text>}
      {resenas.map((r) => (
        <View key={r.id} style={ui.card}>
          <Text style={{ fontWeight: '600' }}>{`${'★'.repeat(r.puntuacion)}${'☆'.repeat(5 - r.puntuacion)}  ${r.comprador.nombre} ${r.comprador.apellido}`}</Text>
          <Text style={ui.texto}>{r.evento.nombre}</Text>
          {!!r.detalle && <Text style={ui.texto}>{r.detalle}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}