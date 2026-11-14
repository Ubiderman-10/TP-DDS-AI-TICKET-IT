import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventosService, categoriasService } from '../services/events';
import { alternarFavorito } from '../services/favoritos';
import { getUsuario, setUsuario } from '../session';
import EventoCard from '../components/EventoCard';
import IconButton from '../components/IconButton';
import Selector from '../components/Selector';
import Vacio from '../components/Vacio';
import { ui, colores } from '../theme';

// valor = "criterio|direccion" (se separa antes de llamar al backend)
const OPCIONES_ORDEN = [
  { valor: null, etiqueta: 'Sin ordenar' },
  { valor: 'precio|desc', etiqueta: 'Mayor precio' },
  { valor: 'precio|asc', etiqueta: 'Menor precio' },
  { valor: 'fecha|asc', etiqueta: 'Fecha más próxima' },
  { valor: 'fecha|desc', etiqueta: 'Fecha más lejana' },
  { valor: 'puntajeOrganizador|desc', etiqueta: 'Mayor puntaje' },
  { valor: 'puntajeOrganizador|asc', etiqueta: 'Menor puntaje' },
];

export default function ListadoEventosScreen({ navigation }) {
  const usuario = getUsuario();
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [orden, setOrden] = useState(null);
  const [favoritos, setFavoritos] = useState(usuario.favoritos || []);
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const ultimaBusqueda = useRef(0);

  const salir = () => {
    setUsuario(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icono="receipt-outline" etiqueta="Mis compras" onPress={() => navigation.navigate('MisCompras')} style={{ marginRight: 18 }} />
          <IconButton icono="log-out-outline" etiqueta="Cerrar sesión" onPress={salir} />
        </View>
      ),
    });
  }, [navigation]);

  // Al volver de otra pantalla (por ejemplo del detalle) se actualizan los favoritos.
  useFocusEffect(
    useCallback(() => {
      setFavoritos(getUsuario()?.favoritos || []);
    }, [])
  );

  const toggleFavorito = async (eventoId) => {
    try {
      setFavoritos(await alternarFavorito(eventoId));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    categoriasService.listar().then(setCategorias).catch((e) => Alert.alert('Error', e.message));
  }, []);

  // Busca con un pequeño retraso al tipear; ignora respuestas viejas si llegan tarde.
  useEffect(() => {
    const id = ++ultimaBusqueda.current;
    const timer = setTimeout(async () => {
      try {
        setCargando(true);
        const params = {};
        if (texto.trim()) params.texto = texto.trim();
        if (categoriaId) params.categoriaId = categoriaId;
        if (orden) {
          const [criterio, direccion] = orden.split('|');
          params.orden = criterio;
          params.direccion = direccion;
        }
        const resultado = await eventosService.listar(params);
        if (id === ultimaBusqueda.current) setEventos(resultado);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        if (id === ultimaBusqueda.current) setCargando(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [texto, categoriaId, orden]);

  const visibles = soloFavoritos ? eventos.filter((e) => favoritos.includes(e.id)) : eventos;
  const opcionesCategoria = [{ valor: null, etiqueta: 'Todas las categorías' }, ...categorias.map((c) => ({ valor: c.id, etiqueta: c.nombre }))];

  return (
    <View style={ui.pantalla}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colores.primario }}>
        <View style={[ui.fila, { flexWrap: 'nowrap' }]}>
          <View style={[ui.fila, { flexWrap: 'nowrap', flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12 }]}>
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              style={{ flex: 1, paddingVertical: 11, paddingHorizontal: 8, fontSize: 15, color: colores.texto }}
              value={texto}
              onChangeText={setTexto}
              placeholder="Buscar eventos..."
              placeholderTextColor="#9ca3af"
            />
            {!!texto && <IconButton icono="close-circle" etiqueta="Borrar búsqueda" color="#9ca3af" size={18} onPress={() => setTexto('')} />}
          </View>
          {/* Favoritos va aparte de los filtros */}
          <IconButton
            icono={soloFavoritos ? 'heart' : 'heart-outline'}
            etiqueta={soloFavoritos ? 'Ver todos los eventos' : 'Ver solo mis favoritos'}
            color={soloFavoritos ? colores.peligro : '#fff'}
            size={22}
            onPress={() => setSoloFavoritos(!soloFavoritos)}
            style={{ width: 46, height: 46, marginLeft: 10, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: soloFavoritos ? '#fff' : '#ffffff33' }}
          />
        </View>
      </View>

      <View style={[ui.fila, { flexWrap: 'nowrap', paddingHorizontal: 16, paddingVertical: 12 }]}>
        <Selector titulo="Categoría" icono="albums-outline" valor={categoriaId} opciones={opcionesCategoria} onChange={setCategoriaId} estilo={{ marginRight: 10 }} />
        <Selector titulo="Ordenar por" icono="swap-vertical-outline" valor={orden} opciones={OPCIONES_ORDEN} onChange={setOrden} />
      </View>

      {cargando ? (
        <View style={ui.centro}>
          <ActivityIndicator size="large" color={colores.primario} />
        </View>
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(e) => e.id.toString()}
          contentContainerStyle={ui.lista}
          ListEmptyComponent={<Vacio icono="search-outline" mensaje={soloFavoritos ? 'Todavía no marcaste favoritos' : 'No se encontraron eventos'} />}
          renderItem={({ item }) => (
            <EventoCard
              evento={item}
              esFavorito={favoritos.includes(item.id)}
              onToggleFavorito={() => toggleFavorito(item.id)}
              onPress={() => navigation.navigate('DetalleEvento', { id: item.id })}
            />
          )}
        />
      )}
    </View>
  );
}