import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, View, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { resenasService } from '../services/events';
import { getUsuario } from '../session';
import { ui, colores } from '../theme';

export default function CalificarEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const usuario = getUsuario();
  const headerHeight = useHeaderHeight();
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const calificar = async () => {
    setEnviando(true);
    try {
      await resenasService.calificar(eventoId, usuario.id, puntuacion, comentario.trim());
      Alert.alert('Gracias', 'Tu reseña fue publicada', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('No se pudo calificar', error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={ui.pantalla} behavior="padding" keyboardVerticalOffset={headerHeight}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={ui.titulo}>¿Cómo fue tu experiencia?</Text>
        <View style={[ui.fila, { marginVertical: 16 }]}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setPuntuacion(n)}>
              <Text style={{ fontSize: 40, color: n <= puntuacion ? '#f59e0b' : '#d1d5db', marginRight: 6 }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={ui.texto}>Comentario</Text>
        <TextInput
          style={[ui.input, { height: 100, textAlignVertical: 'top', marginTop: 6 }]}
          value={comentario}
          onChangeText={setComentario}
          placeholder="Contanos cómo estuvo..."
          placeholderTextColor={colores.textoSuave}
          multiline
        />
        <TouchableOpacity style={[ui.boton, { marginTop: 16 }, (puntuacion < 1 || enviando) && { opacity: 0.5 }]} onPress={calificar} disabled={puntuacion < 1 || enviando}>
          <Text style={ui.botonTexto}>{enviando ? 'Enviando...' : 'Publicar reseña'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}