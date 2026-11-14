import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { usuariosService } from '../services/events';
import { setUsuario } from '../session';
import { API_BASE_URL } from '../services/api';
import { ui } from '../theme';

// El TP no exige autenticación: se elige con qué usuario operar.
export default function LoginScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);
      setUsuarios(await usuariosService.listar());
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const elegir = (usuario) => {
    setUsuario(usuario);
    navigation.replace('ListadoEventos');
  };

  if (cargando) {
    return (
      <View style={ui.centro}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={ui.pantalla}>
      <View style={{ padding: 16 }}>
        <Text style={ui.titulo}>¿Con qué usuario querés entrar?</Text>
        <Text style={ui.texto}>{`Servidor: ${API_BASE_URL}`}</Text>
      </View>
      <FlatList
        data={usuarios}
        keyExtractor={(u) => u.id.toString()}
        contentContainerStyle={ui.lista}
        ListEmptyComponent={
          <TouchableOpacity style={ui.boton} onPress={cargar}>
            <Text style={ui.botonTexto}>No hay usuarios. Reintentar</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={ui.card} onPress={() => elegir(item)}>
            <Text style={ui.titulo}>{`${item.nombre} ${item.apellido}`}</Text>
            <Text style={ui.texto}>{`Usuario #${item.id}`}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}