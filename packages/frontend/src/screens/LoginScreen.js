import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usuariosService } from '../services/events';
import { setUsuario } from '../session';
import { API_BASE_URL } from '../services/api';
import Avatar from '../components/Avatar';
import { ui, colores } from '../theme';

const ROL = {
  ORGANIZADOR: { texto: 'Organizador', color: '#7c3aed', icono: 'megaphone-outline' },
  COMPRADOR: { texto: 'Comprador', color: '#059669', icono: 'ticket-outline' },
  AMBOS: { texto: 'Organizador y comprador', color: '#2563eb', icono: 'people-outline' },
};

// El TP no exige autenticación: se elige con qué usuario operar.
// Cada usuario tiene un rol (ORGANIZADOR o COMPRADOR) que define sus funcionalidades.
export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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
    // Cada rol tiene su pantalla de inicio: el organizador gestiona sus eventos, el comprador explora el catálogo.
    navigation.replace(usuario.rol === 'ORGANIZADOR' ? 'MisEventos' : 'ListadoEventos');
  };

  return (
    <View style={ui.pantalla}>
      <View style={{ backgroundColor: colores.primario, paddingTop: insets.top + 28, paddingBottom: 36, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <Text style={{ fontSize: 44 }}>🎟️</Text>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 4 }}>AI Ticket It</Text>
        <Text style={{ color: '#c7d2fe', fontSize: 15, marginTop: 4 }}>Descubrí eventos y comprá tus entradas</Text>
      </View>

      <Text style={[ui.subtitulo, { marginHorizontal: 20 }]}>¿Con qué usuario querés entrar?</Text>

      {cargando ? (
        <View style={[ui.centro, { flex: 0, marginTop: 40 }]}>
          <ActivityIndicator size="large" color={colores.primario} />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(u) => u.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <TouchableOpacity style={ui.boton} onPress={cargar}>
              <Text style={ui.botonTexto}>No se pudo cargar. Reintentar</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={[ui.card, ui.fila, { flexWrap: 'nowrap' }]} onPress={() => elegir(item)} activeOpacity={0.85}>
              <Avatar nombre={item.nombre} apellido={item.apellido} id={item.id} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[ui.titulo, { fontSize: 17 }]}>{`${item.nombre} ${item.apellido}`}</Text>
                <View style={[ui.fila, { marginTop: 4 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${(ROL[item.rol] || ROL.AMBOS).color}1f`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                    <Ionicons name={(ROL[item.rol] || ROL.AMBOS).icono} size={13} color={(ROL[item.rol] || ROL.AMBOS).color} />
                    <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: '700', color: (ROL[item.rol] || ROL.AMBOS).color }}>{(ROL[item.rol] || ROL.AMBOS).texto}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        />
      )}
      <Text style={{ textAlign: 'center', color: '#9ca3af', fontSize: 11, paddingBottom: insets.bottom + 8 }}>{`Servidor: ${API_BASE_URL}`}</Text>
    </View>
  );
}