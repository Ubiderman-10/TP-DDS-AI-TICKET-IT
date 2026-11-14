import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, ui } from '../theme';

// Lista desplegable: un botón que muestra la opción elegida y abre una lista para cambiarla.
export default function Selector({ titulo, icono, valor, opciones, onChange, estilo }) {
  const [abierto, setAbierto] = useState(false);
  const actual = opciones.find((o) => o.valor === valor) || opciones[0];
  const activo = valor !== opciones[0].valor;

  return (
    <>
      <TouchableOpacity
        style={[ui.chip, { flex: 1, justifyContent: 'space-between', marginRight: 0 }, activo && { borderColor: colores.primario, backgroundColor: colores.primarioClaro }, estilo]}
        onPress={() => setAbierto(true)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name={icono} size={16} color={colores.primario} />
          <Text style={[ui.chipTexto, { marginLeft: 6, flex: 1 }]} numberOfLines={1}>{actual.etiqueta}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={colores.textoSuave} />
      </TouchableOpacity>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 }} activeOpacity={1} onPress={() => setAbierto(false)}>
          <View style={{ backgroundColor: '#fff', borderRadius: 18, paddingVertical: 8, maxHeight: '70%' }}>
            <Text style={[ui.titulo, { fontSize: 17, paddingHorizontal: 20, paddingVertical: 12 }]}>{titulo}</Text>
            <FlatList
              data={opciones}
              keyExtractor={(o) => String(o.valor)}
              renderItem={({ item }) => {
                const elegida = item.valor === valor;
                return (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: elegida ? colores.primarioClaro : '#fff' }}
                    onPress={() => {
                      onChange(item.valor);
                      setAbierto(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: elegida ? '800' : '500', color: elegida ? colores.primario : colores.texto }}>{item.etiqueta}</Text>
                    {elegida && <Ionicons name="checkmark" size={20} color={colores.primario} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}