import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { eventosService, organizadoresService, tiposEntradaService, comprasService, resenasService } from '../services/events';
import TipoEntradaCard from '../components/TipoEntradaCard';
import Avatar from '../components/Avatar';
import Vacio from '../components/Vacio';
import { alternarFavorito } from '../services/favoritos';
import IconButton from '../components/IconButton';
import { getUsuario, puedeComprar } from '../session';
import { ui, colores, visualCategoria, formatearFechaHora, formatearPrecio } from '../theme';

function Info({ icono, texto }) {
  return (
    <View style={[ui.fila, { flexWrap: 'nowrap', marginTop: 8 }]}>
      <Ionicons name={icono} size={16} color={colores.primario} />
      <Text style={{ marginLeft: 8, fontSize: 14, color: colores.texto, flex: 1 }}>{texto}</Text>
    </View>
  );
}

function Estrellas({ valor, size = 14 }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= valor ? 'star' : 'star-outline'} size={size} color={colores.acento} />
      ))}
    </View>
  );
}

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
    // Volver a tocar el tipo ya elegido (por ejemplo un + deshabilitado en el máximo) no reinicia la cantidad.
    if (tipoSeleccionado?.id === tipo.id) return;
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
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const esOrganizador = usuario && evento.organizador.id === usuario.id;
  // Un usuario que no puede comprar (organizador) ve el evento en modo gestión.
  const modoGestion = esOrganizador || !puedeComprar(usuario);
  const visual = visualCategoria(evento.categoria?.nombre);

  return (
    <ScrollView style={ui.pantalla} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ backgroundColor: visual.color, height: 150, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 72 }}>{visual.emoji}</Text>
        {puedeComprar(usuario) && (
          <IconButton
            icono={esFavorito ? 'heart' : 'heart-outline'}
            etiqueta={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            color={esFavorito ? colores.peligro : colores.textoSuave}
            size={22}
            onPress={toggleFavorito}
            style={{ position: 'absolute', top: 14, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffffee', alignItems: 'center', justifyContent: 'center' }}
          />
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: -30 }}>
        <View style={ui.card}>
          <Text style={ui.titulo}>{evento.nombre}</Text>
          <Text style={[ui.texto, { marginTop: 6 }]}>{evento.descripcion}</Text>
          <Info icono="calendar-outline" texto={formatearFechaHora(evento.fecha)} />
          <Info icono="pricetag-outline" texto={evento.categoria?.nombre || 'Sin categoría'} />
          <Info icono="person-outline" texto={`Organiza ${evento.organizador.nombre} ${evento.organizador.apellido}`} />
          <View style={[ui.fila, { marginTop: 8 }]}>
            <Ionicons name="star" size={16} color={colores.acento} />
            <Text style={{ marginLeft: 8, fontSize: 14, color: colores.texto }}>
              {puntaje > 0 ? `${puntaje.toFixed(1)} / 5.0 como organizador` : 'Organizador sin reseñas todavía'}
            </Text>
          </View>
        </View>

        {esOrganizador && (
          <>
            <Text style={[ui.texto, { marginBottom: 8 }]}>Estás viendo tu evento como organizador: acá ves la disponibilidad, las ventas y las reseñas.</Text>
            <TouchableOpacity style={ui.boton} onPress={() => navigation.navigate('ComprasEvento', { eventoId: evento.id })}>
              <View style={[ui.fila, { flexWrap: 'nowrap' }]}>
                <Ionicons name="stats-chart" size={18} color="#fff" />
                <Text style={[ui.botonTexto, { marginLeft: 8 }]}>Ver ventas de este evento</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        <Text style={ui.subtitulo}>Entradas</Text>
        {evento.tiposEntrada.length === 0 && <Text style={ui.texto}>Este evento todavía no tiene entradas.</Text>}
        {evento.tiposEntrada.map((tipo) => (
          <TipoEntradaCard
            key={tipo.id}
            tipo={tipo}
            disponibles={disponibles[tipo.id]}
            seleccionado={tipoSeleccionado?.id === tipo.id}
            cantidad={cantidad}
            onSeleccionar={() => !modoGestion && seleccionar(tipo)}
            onCantidadCambio={cambiarCantidad}
          />
        ))}

        {!modoGestion && (
          <TouchableOpacity style={[ui.boton, (!tipoSeleccionado || comprando) && { opacity: 0.5 }]} onPress={comprar} disabled={!tipoSeleccionado || comprando}>
            <Text style={ui.botonTexto}>
              {comprando
                ? 'Procesando...'
                : tipoSeleccionado
                ? `Comprar ${cantidad} x ${tipoSeleccionado.nombre} · ${formatearPrecio(tipoSeleccionado.precio * cantidad)}`
                : 'Elegí un tipo de entrada'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={ui.subtitulo}>Reseñas de eventos anteriores</Text>
        <Text style={[ui.texto, { marginTop: -4, marginBottom: 10 }]}>{`Experiencias de quienes asistieron a eventos de ${evento.organizador.nombre} ${evento.organizador.apellido}`}</Text>
        {resenas.length === 0 && <Vacio icono="chatbox-ellipses-outline" mensaje="Todavía no hay reseñas." />}
        {resenas.map((r) => (
          <View key={r.id} style={ui.card}>
            <View style={[ui.fila, { flexWrap: 'nowrap' }]}>
              <Avatar nombre={r.comprador.nombre} apellido={r.comprador.apellido} id={r.comprador.id} size={36} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colores.texto }}>{`${r.comprador.nombre} ${r.comprador.apellido}`}</Text>
                <Text style={[ui.texto, { marginTop: 0, fontSize: 12 }]}>{r.evento.nombre}</Text>
              </View>
              <Estrellas valor={r.puntuacion} />
            </View>
            {!!r.detalle && <Text style={[ui.texto, { marginTop: 10, color: colores.texto }]}>{r.detalle}</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}