import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { mensajesService } from '../services/events';
import { getUsuario } from '../session';
import { ui, colores } from '../theme';

// La burbuja está definida acá adentro a propósito: así no depende de cómo exporte otro archivo.
function Burbuja({ mensaje, esYo }) {
  return (
    <View style={{ alignItems: esYo ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <View style={{ maxWidth: '80%', padding: 10, borderRadius: 12, backgroundColor: esYo ? colores.primario : colores.blanco }}>
        {!esYo && (
          <Text style={{ fontSize: 12, fontWeight: '600', color: colores.textoSuave }}>
            {`${mensaje.emisor.nombre} ${mensaje.emisor.apellido}`}
          </Text>
        )}
        <Text style={{ fontSize: 14, color: esYo ? colores.blanco : colores.texto }}>{mensaje.texto}</Text>
        <Text style={{ fontSize: 10, color: esYo ? '#dbeafe' : colores.textoSuave, marginTop: 4 }}>
          {new Date(mensaje.enviado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

export default function ChatCompraScreen({ route }) {
  const { compraId } = route.params;
  const usuario = getUsuario();
  const headerHeight = useHeaderHeight();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const lista = useRef(null);

  const cargar = useCallback(async () => {
    try {
      setMensajes(await mensajesService.obtener(compraId));
    } catch (error) {
      console.warn('Chat:', error.message);
    }
  }, [compraId]);

  // Refresco periódico para ver las respuestas de la otra parte (no hay websockets en el TP).
  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, 4000);
    return () => clearInterval(timer);
  }, [cargar]);

  const irAlFinal = () => lista.current?.scrollToEnd({ animated: true });

  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await mensajesService.enviar(compraId, usuario.id, texto.trim());
      setTexto('');
      await cargar();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    // El KeyboardAvoidingView sube todo el contenido cuando aparece el teclado,
    // así la caja de texto y los últimos mensajes siempre quedan visibles.
    <KeyboardAvoidingView style={ui.pantalla} behavior="padding" keyboardVerticalOffset={headerHeight}>
      <FlatList
        ref={lista}
        data={mensajes}
        keyExtractor={(m) => m.id.toString()}
        contentContainerStyle={ui.lista}
        onContentSizeChange={irAlFinal}
        onLayout={irAlFinal}
        ListEmptyComponent={<Text style={[ui.texto, { textAlign: 'center', marginTop: 32 }]}>Todavía no hay mensajes</Text>}
        renderItem={({ item }) => <Burbuja mensaje={item} esYo={item.emisor.id === usuario.id} />}
      />
      <View style={[ui.fila, { padding: 8, backgroundColor: '#fff', flexWrap: 'nowrap' }]}>
        <TextInput
          style={[ui.input, { flex: 1 }]}
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          onSubmitEditing={enviar}
          onFocus={() => setTimeout(irAlFinal, 300)}
        />
        <TouchableOpacity
          style={[ui.botonChico, { marginTop: 0, marginLeft: 8 }, (enviando || !texto.trim()) && { opacity: 0.5 }]}
          onPress={enviar}
          disabled={enviando || !texto.trim()}
        >
          <Text style={ui.botonTexto}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}