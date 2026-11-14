import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import ListadoEventosScreen from './screens/ListadoEventosScreen';
import DetalleEventoScreen from './screens/DetalleEventoScreen';
import MisComprasScreen from './screens/MisComprasScreen';
import ChatCompraScreen from './screens/ChatCompraScreen';
import CalificarEventoScreen from './screens/CalificarEventoScreen';
import ComprasEventoScreen from './screens/ComprasEventoScreen';
import CrearEventoScreen from './screens/CrearEventoScreen';
import MisEventosScreen from './screens/MisEventosScreen';
import { AyudaHost } from './components/Ayuda';
import { colores } from './theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '800' },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MisEventos" component={MisEventosScreen} options={{ title: 'Mis eventos' }} />
        <Stack.Screen name="ListadoEventos" component={ListadoEventosScreen} options={{ title: 'Eventos' }} />
        <Stack.Screen name="DetalleEvento" component={DetalleEventoScreen} options={{ title: 'Detalle' }} />
        <Stack.Screen name="MisCompras" component={MisComprasScreen} options={{ title: 'Mis compras' }} />
        <Stack.Screen name="ChatCompra" component={ChatCompraScreen} options={{ title: 'Chat de la compra' }} />
        <Stack.Screen name="CalificarEvento" component={CalificarEventoScreen} options={{ title: 'Calificar evento' }} />
        <Stack.Screen name="CrearEvento" component={CrearEventoScreen} options={{ title: 'Crear evento' }} />
        <Stack.Screen name="ComprasEvento" component={ComprasEventoScreen} options={{ title: 'Ventas del evento' }} />
      </Stack.Navigator>
      <AyudaHost />
    </NavigationContainer>
    </SafeAreaProvider>
  );
}