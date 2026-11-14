import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// En un celular "localhost" es el propio celular, no tu PC.
// Se toma la IP de la PC desde la que Expo sirve el bundle (hostUri = "192.168.x.x:8081").
// Si usás túnel (--tunnel) o falla la detección, definí EXPO_PUBLIC_API_URL=http://TU_IP:3000/api
function detectarBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return `http://${window.location.hostname}:3000/api`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host || 'localhost'}:3000/api`;
}

export const API_BASE_URL = detectarBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// El backend responde errores como { error: true, code, message }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      error.message = data?.message || `Error ${status}`;
      error.statusCode = status;
      error.errorCode = data?.code;
    } else if (error.request) {
      error.message = `No se pudo conectar con el servidor (${API_BASE_URL}). Verificá que el backend esté corriendo y que el celular y la PC estén en la misma red.`;
    }
    return Promise.reject(error);
  }
);

export default api;