import React from 'react';
import { View, Text } from 'react-native';

const PALETA = ['#4f46e5', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2'];

export default function Avatar({ nombre, apellido, id = 0, size = 48 }) {
  const iniciales = `${(nombre || '?')[0]}${(apellido || '')[0] || ''}`.toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: PALETA[id % PALETA.length], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>{iniciales}</Text>
    </View>
  );
}