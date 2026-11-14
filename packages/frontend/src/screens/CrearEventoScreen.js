import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { categoriasService, eventosService } from '../services/events';
import { getUsuario } from '../session';
import { ui } from '../theme';

const tipoVacio = () => ({ nombre: '', descripcion: '', precio: '', cupo: '' });

export default function CrearEventoScreen({ navigation }) {
  const usuario = getUsuario();
  const headerHeight = useHeaderHeight();
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(''); // formato: 2026-12-31 20:00
  const [imagen, setImagen] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [tipos, setTipos] = useState([tipoVacio()]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    categoriasService.listar().then(setCategorias).catch((e) => Alert.alert('Error', e.message));
  }, []);

  const cambiarTipo = (indice, campo, valor) =>
    setTipos((actuales) => actuales.map((t, i) => (i === indice ? { ...t, [campo]: valor } : t)));

  const crear = async () => {
    const fechaEvento = new Date(fecha.trim().replace(' ', 'T'));
    if (!nombre.trim() || !descripcion.trim()) return Alert.alert('Atención', 'Completá nombre y descripción');
    if (Number.isNaN(fechaEvento.getTime())) return Alert.alert('Atención', 'La fecha debe tener el formato AAAA-MM-DD HH:mm');
    if (fechaEvento < new Date()) return Alert.alert('Atención', 'La fecha tiene que ser futura');
    if (!categoriaId) return Alert.alert('Atención', 'Elegí una categoría');
    if (tipos.some((t) => !t.nombre.trim() || !t.descripcion.trim() || !(Number(t.precio) > 0) || !(Number(t.cupo) > 0))) {
      return Alert.alert('Atención', 'Cada tipo de entrada necesita nombre, descripción, precio y cupo mayores a 0');
    }

    setEnviando(true);
    try {
      const evento = await eventosService.crear({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        fecha: fechaEvento.toISOString(),
        multimedia: [imagen.trim() || 'https://example.com/evento.jpg'],
        organizadorId: usuario.id,
        categoriaId,
        tiposEntrada: tipos.map((t) => ({
          nombre: t.nombre.trim(),
          descripcion: t.descripcion.trim(),
          precio: Number(t.precio),
          cupo: Number(t.cupo),
        })),
      });
      Alert.alert('Evento creado', evento.nombre, [{ text: 'OK', onPress: () => navigation.replace('DetalleEvento', { id: evento.id }) }]);
    } catch (error) {
      Alert.alert('No se pudo crear', error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={ui.pantalla} behavior="padding" keyboardVerticalOffset={headerHeight}>
    <ScrollView contentContainerStyle={[ui.lista, { paddingBottom: 40 }]} keyboardShouldPersistTaps="handled">
      <View style={ui.card}>
        <Text style={ui.texto}>Nombre</Text>
        <TextInput style={ui.input} value={nombre} onChangeText={setNombre} placeholder="Confeti Fest" />
        <Text style={[ui.texto, { marginTop: 10 }]}>Descripción</Text>
        <TextInput style={ui.input} value={descripcion} onChangeText={setDescripcion} placeholder="De qué se trata" multiline />
        <Text style={[ui.texto, { marginTop: 10 }]}>Fecha y hora (AAAA-MM-DD HH:mm)</Text>
        <TextInput style={ui.input} value={fecha} onChangeText={setFecha} placeholder="2026-12-31 20:00" autoCapitalize="none" />
        <Text style={[ui.texto, { marginTop: 10 }]}>URL de imagen (opcional)</Text>
        <TextInput style={ui.input} value={imagen} onChangeText={setImagen} placeholder="https://..." autoCapitalize="none" />
      </View>

      <Text style={ui.subtitulo}>Categoría</Text>
      <View style={ui.fila}>
        {categorias.map((c) => (
          <TouchableOpacity key={c.id} style={[ui.chip, { marginBottom: 8 }, categoriaId === c.id && ui.chipActivo]} onPress={() => setCategoriaId(c.id)}>
            <Text style={[ui.chipTexto, categoriaId === c.id && ui.chipTextoActivo]}>{c.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={ui.subtitulo}>Tipos de entrada</Text>
      {tipos.map((t, i) => (
        <View key={i} style={ui.card}>
          <TextInput style={ui.input} value={t.nombre} onChangeText={(v) => cambiarTipo(i, 'nombre', v)} placeholder="Nombre (General, VIP...)" />
          <TextInput style={[ui.input, { marginTop: 8 }]} value={t.descripcion} onChangeText={(v) => cambiarTipo(i, 'descripcion', v)} placeholder="Descripción" />
          <View style={[ui.fila, { marginTop: 8 }]}>
            <TextInput style={[ui.input, { flex: 1, marginRight: 8 }]} value={t.precio} onChangeText={(v) => cambiarTipo(i, 'precio', v)} placeholder="Precio" keyboardType="numeric" />
            <TextInput style={[ui.input, { flex: 1 }]} value={t.cupo} onChangeText={(v) => cambiarTipo(i, 'cupo', v)} placeholder="Cupo" keyboardType="numeric" />
          </View>
          {tipos.length > 1 && (
            <TouchableOpacity style={[ui.botonChico, ui.botonPeligro, { alignSelf: 'flex-start' }]} onPress={() => setTipos((a) => a.filter((_, j) => j !== i))}>
              <Text style={ui.botonTexto}>Quitar</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={[ui.boton, { backgroundColor: '#6b7280' }]} onPress={() => setTipos((a) => [...a, tipoVacio()])}>
        <Text style={ui.botonTexto}>+ Agregar tipo de entrada</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[ui.boton, { marginTop: 16 }, enviando && { opacity: 0.5 }]} onPress={crear} disabled={enviando}>
        <Text style={ui.botonTexto}>{enviando ? 'Creando...' : 'Crear evento'}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}