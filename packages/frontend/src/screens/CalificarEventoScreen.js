import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { resenasService } from '../services/events';
import { getUsuario } from '../session';
import { ui, colores } from '../theme';

const ETIQUETAS = ['Tocá una estrella para calificar', 'Malo', 'Regular', 'Bueno', 'Muy bueno', '¡Excelente!'];

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
        <View style={[ui.card, { alignItems: 'center', paddingVertical: 28 }]}>
          <Text style={ui.titulo}>¿Cómo fue tu experiencia?</Text>
          <View style={[ui.fila, { marginTop: 18 }]}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setPuntuacion(n)} hitSlop={4}>
                <Ionicons name={n <= puntuacion ? 'star' : 'star-outline'} size={46} color={n <= puntuacion ? colores.acento : '#d1d5db'} style={{ marginHorizontal: 3 }} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ marginTop: 12, fontWeight: '700', color: puntuacion ? colores.primario : colores.textoSuave }}>{ETIQUETAS[puntuacion]}</Text>
        </View>

        <Text style={ui.subtitulo}>Comentario</Text>
        <TextInput
          style={[ui.input, { height: 110, textAlignVertical: 'top' }]}
          value={comentario}
          onChangeText={setComentario}
          placeholder="Contanos cómo estuvo..."
          placeholderTextColor={colores.textoSuave}
          multiline
        />
        <TouchableOpacity style={[ui.boton, { marginTop: 18 }, (puntuacion < 1 || enviando) && { opacity: 0.5 }]} onPress={calificar} disabled={puntuacion < 1 || enviando}>
          <Text style={ui.botonTexto}>{enviando ? 'Enviando...' : 'Publicar reseña'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}