import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../theme';

// Estado vacío: ícono + mensaje.
export default function Vacio({ icono = 'file-tray-outline', mensaje }) {
  return (
    <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 24 }}>
      <Ionicons name={icono} size={52} color="#cbd5e1" />
      <Text style={{ marginTop: 10, fontSize: 15, color: colores.textoSuave, textAlign: 'center' }}>{mensaje}</Text>
    </View>
  );
}