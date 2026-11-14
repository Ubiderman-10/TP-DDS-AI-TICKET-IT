import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Muestra un cartelito con el significado de un botón de ícono cuando se lo mantiene apretado.
let mostrar = null;

export function mostrarAyuda(texto) {
  if (mostrar) mostrar(texto);
}

export function AyudaHost() {
  const insets = useSafeAreaInsets();
  const [texto, setTexto] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    mostrar = (t) => {
      setTexto(t);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTexto(null), 1800);
    };
    return () => {
      mostrar = null;
      clearTimeout(timer.current);
    };
  }, []);

  if (!texto) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 64, right: 12, zIndex: 100 }}>
      <View style={{ backgroundColor: '#111827', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{texto}</Text>
      </View>
    </View>
  );
}