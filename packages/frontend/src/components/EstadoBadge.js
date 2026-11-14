import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colorEstado, iconoEstado } from '../theme';

export default function EstadoBadge({ estado }) {
  const color = colorEstado[estado] || '#6b7280';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${color}1f`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
      <Ionicons name={iconoEstado[estado] || 'help-circle-outline'} size={14} color={color} />
      <Text style={{ color, fontWeight: '700', fontSize: 12, marginLeft: 4 }}>{estado}</Text>
    </View>
  );
}