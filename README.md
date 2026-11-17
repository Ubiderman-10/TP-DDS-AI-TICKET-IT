# TP-DDS-AI-TICKET-IT

Trabajo Práctico Individual de Desarrollo con IA — AI Ticket It.

## Descripción

Aplicación para explorar eventos y gestionar la compra de entradas. El proyecto tiene una API REST en Node.js y Express, y una aplicación móvil desarrollada con React Native y Expo.

Entre sus funcionalidades están la creación y búsqueda de eventos, filtros y ordenamiento, compra y gestión de entradas, favoritos, reseñas y chat entre comprador y organizador.

## Estructura

- `packages/backend/`: API, reglas de negocio, persistencia en memoria y tests.
- `packages/frontend/`: aplicación Expo para Android, iOS y web.

## Requisitos

- Node.js y npm.

## Instalación

Instalá las dependencias de cada paquete desde la raíz del repositorio:

```bash
npm install --prefix packages/backend
npm install --prefix packages/frontend
```

## Ejecución

Abrí dos terminales desde la raíz del proyecto.

En una, iniciá el backend:

```bash
npm run start:backend
```

La API queda disponible en `http://localhost:3000/api` y carga datos de ejemplo al iniciar.

En la otra, iniciá Expo:

```bash
npm run start:frontend
```

Para abrir la versión web:

```bash
npm run web
```

En un dispositivo físico, la computadora y el teléfono deben poder comunicarse por la red local. La aplicación intenta detectar la dirección del servidor automáticamente; si hace falta, se puede configurar `EXPO_PUBLIC_API_URL` con la URL accesible de la API.

## Tests

Desde la raíz, ejecutá:

```bash
npm test
```

El comando ejecuta los tests del backend con el runner integrado de Node (`node --test`).

## Documentación

La referencia de endpoints y reglas de negocio está en [packages/backend/API.md](packages/backend/API.md). Los datos del backend se guardan en memoria y se reinician al volver a iniciar el servidor.

El proyecto no implementa autenticación real; los identificadores de usuario enviados a la API se usan para representar los roles y permisos dentro del alcance académico.
