import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { ui, colores, formatearFecha } from '../theme';

const dos = (n) => String(n).padStart(2, '0');

// Combina la fecha o la hora elegida con el resto del valor actual.
function combinar(base, elegido, modo) {
  const resultado = new Date(base);
  if (modo === 'date') {
    resultado.setFullYear(elegido.getFullYear(), elegido.getMonth(), elegido.getDate());
  } else {
    resultado.setHours(elegido.getHours(), elegido.getMinutes(), 0, 0);
  }
  return resultado;
}

function Boton({ icono, texto, onPress, estilo }) {
  return (
    <TouchableOpacity style={[ui.input, { flexDirection: 'row', alignItems: 'center', flex: 1 }, estilo]} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icono} size={18} color={colores.primario} />
      <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '600', color: colores.texto }}>{texto}</Text>
    </TouchableOpacity>
  );
}

// Selector de fecha (calendario) y de hora (reloj) nativos.
export default function CampoFechaHora({ valor, onChange }) {
  const [modo, setModo] = useState(null); // 'date' | 'time' | null
  const [temporal, setTemporal] = useState(valor); // solo iOS: valor mientras se elige

  const abrir = (nuevoModo) => {
    setTemporal(valor);
    setModo(nuevoModo);
  };

  // Android: el selector es un diálogo nativo que se cierra solo.
  const alElegirAndroid = (evento, elegido) => {
    const modoActual = modo;
    setModo(null);
    if (evento.type === 'set' && elegido) onChange(combinar(valor, elegido, modoActual));
  };

  return (
    <View>
      <View style={[ui.fila, { flexWrap: 'nowrap' }]}>
        <Boton icono="calendar-outline" texto={formatearFecha(valor)} onPress={() => abrir('date')} estilo={{ marginRight: 10 }} />
        <Boton icono="time-outline" texto={`${dos(valor.getHours())}:${dos(valor.getMinutes())} hs`} onPress={() => abrir('time')} />
      </View>

      {Platform.OS === 'android' && modo && (
        <DateTimePicker value={valor} mode={modo} is24Hour minimumDate={modo === 'date' ? new Date() : undefined} onChange={alElegirAndroid} />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={!!modo} transparent animationType="slide" onRequestClose={() => setModo(null)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' }}>
            <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <DateTimePicker
                value={temporal}
                mode={modo || 'date'}
                display={modo === 'time' ? 'spinner' : 'inline'}
                locale="es-AR"
                is24Hour
                minimumDate={modo === 'date' ? new Date() : undefined}
                onChange={(evento, elegido) => elegido && setTemporal(elegido)}
              />
              <TouchableOpacity
                style={ui.boton}
                onPress={() => {
                  onChange(combinar(valor, temporal, modo));
                  setModo(null);
                }}
              >
                <Text style={ui.botonTexto}>Listo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}