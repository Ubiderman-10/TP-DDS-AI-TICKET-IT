import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mostrarAyuda } from './Ayuda';

// Botón de solo ícono: al mantenerlo apretado muestra qué hace (etiqueta).
export default function IconButton({ icono, etiqueta, onPress, color = '#fff', size = 24, style, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => mostrarAyuda(etiqueta)}
      delayLongPress={350}
      hitSlop={8}
      disabled={disabled}
      accessibilityLabel={etiqueta}
      style={style}
    >
      <Ionicons name={icono} size={size} color={color} />
    </TouchableOpacity>
  );
}