import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { eventosService, categoriasService } from '../services/events';
import { alternarFavorito } from '../services/favoritos';
import { getUsuario, setUsuario } from '../session';
import EventoCard from '../components/EventoCard';
import { ui } from '../theme';

const ORDENES = [
  { valor: 'precio', etiqueta: 'Precio' },
  { valor: 'fecha', etiqueta: 'Fecha' },
  { valor: 'puntajeOrganizador', etiqueta: 'Puntaje' },
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
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => navigation.navigate('CrearEvento')} style={{ marginRight: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Crear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MisCompras')} style={{ marginRight: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Mis compras</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={salir}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Salir</Text>
          </TouchableOpacity>
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
        if (orden) params.orden = orden;
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

  return (
    <View style={ui.pantalla}>
      <View style={{ padding: 12, backgroundColor: '#fff' }}>
        <TextInput style={ui.input} value={texto} onChangeText={setTexto} placeholder="Buscar por nombre o descripción..." />
      </View>

      <View style={{ paddingVertical: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          <TouchableOpacity style={[ui.chip, !categoriaId && ui.chipActivo]} onPress={() => setCategoriaId(null)}>
            <Text style={[ui.chipTexto, !categoriaId && ui.chipTextoActivo]}>Todas</Text>
          </TouchableOpacity>
          {categorias.map((c) => (
            <TouchableOpacity key={c.id} style={[ui.chip, categoriaId === c.id && ui.chipActivo]} onPress={() => setCategoriaId(c.id)}>
              <Text style={[ui.chipTexto, categoriaId === c.id && ui.chipTextoActivo]}>{c.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[ui.fila, { paddingHorizontal: 12, paddingBottom: 8 }]}>
        <TouchableOpacity style={[ui.chip, soloFavoritos && ui.chipActivo]} onPress={() => setSoloFavoritos(!soloFavoritos)}>
          <Text style={[ui.chipTexto, soloFavoritos && ui.chipTextoActivo]}>♥ Favoritos</Text>
        </TouchableOpacity>
        <Text style={[ui.texto, { marginRight: 8 }]}>Ordenar:</Text>
        {ORDENES.map((o) => (
          <TouchableOpacity
            key={o.valor}
            style={[ui.chip, orden === o.valor && ui.chipActivo]}
            onPress={() => setOrden(orden === o.valor ? null : o.valor)}
          >
            <Text style={[ui.chipTexto, orden === o.valor && ui.chipTextoActivo]}>{o.etiqueta}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {cargando ? (
        <View style={ui.centro}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={visibles}
          keyExtractor={(e) => e.id.toString()}
          contentContainerStyle={ui.lista}
          ListEmptyComponent={<Text style={[ui.texto, { textAlign: 'center', marginTop: 32 }]}>No se encontraron eventos</Text>}
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