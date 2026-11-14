import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { mensajesService } from '../services/events';
import { getUsuario } from '../session';
import Vacio from '../components/Vacio';
import IconButton from '../components/IconButton';
import { ui, colores } from '../theme';

// La burbuja está definida acá adentro a propósito: así no depende de cómo exporte otro archivo.
function Burbuja({ mensaje, esYo }) {
  return (
    <View style={{ alignItems: esYo ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      <View
        style={{
          maxWidth: '80%',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 18,
          borderBottomRightRadius: esYo ? 4 : 18,
          borderBottomLeftRadius: esYo ? 18 : 4,
          backgroundColor: esYo ? colores.primario : colores.blanco,
          borderWidth: esYo ? 0 : 1,
          borderColor: colores.borde,
        }}
      >
        {!esYo && (
          <Text style={{ fontSize: 12, fontWeight: '700', color: colores.primario }}>
            {`${mensaje.emisor.nombre} ${mensaje.emisor.apellido}`}
          </Text>
        )}
        <Text style={{ fontSize: 15, color: esYo ? colores.blanco : colores.texto }}>{mensaje.texto}</Text>
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
        ListEmptyComponent={<Vacio icono="chatbubbles-outline" mensaje="Todavía no hay mensajes. ¡Escribí el primero!" />}
        renderItem={({ item }) => <Burbuja mensaje={item} esYo={item.emisor.id === usuario.id} />}
      />
      <View style={[ui.fila, { padding: 10, backgroundColor: '#fff', flexWrap: 'nowrap', borderTopWidth: 1, borderTopColor: colores.borde }]}>
        <TextInput
          style={[ui.input, { flex: 1, borderRadius: 22, backgroundColor: colores.fondo }]}
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          onSubmitEditing={enviar}
          onFocus={() => setTimeout(irAlFinal, 300)}
        />
        <IconButton
          icono="send"
          etiqueta="Enviar mensaje"
          size={18}
          onPress={enviar}
          disabled={enviando || !texto.trim()}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colores.primario, alignItems: 'center', justifyContent: 'center', marginLeft: 8, opacity: enviando || !texto.trim() ? 0.5 : 1 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}