# API REST - AI Ticket It (Backend)

## Contexto del trabajo práctico

Plataforma para **venta de entradas a eventos** (recitales, conciertos, teatro, deportes, etc.).

- **Organizador**: publica eventos con descripción, fecha, multimedia; define **tipos de entrada** con precio y cupo; monitorea compras y disponibilidad.
- **Comprador**: busca eventos por texto o categoría, ordena por precio/fecha/puntuación; **compra** entradas respetando cupos; **cancela** si la compra no está usada y el evento no comenzó; **reseña** un evento cuando la entrada está **UTILIZADA**.

La API REST está definida bajo la base `http://localhost:3000/api`.

## Información general

| Aspecto | Detalle |
| --- | --- |
| Entorno | `http://localhost:3000/api` |
| Documentación interactiva | `http://localhost:3000/api-docs` |
| Gitignore recomendado | `node_modules`, `*.log`, `.env` |
| Persistencia | En memoria (arrays) en `repository/` |

## Capas

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Domain | `domain/` | Entidades del modelo: `Usuario`, `Evento`, `Categoria`, `TipoEntrada`, `Compra`, `Mensaje`, `Reseña`, `CambioEstadoCompra`, `EstadoCompra`. Reglas de negocio básicas. |
| Repository | `repository/` | Implementación en memoria. Todos los repositorios heredan de `RepositorioEnMemoriaBase` y gestionan arrays. |
| Service | `service/` | Lógica de negocio: validaciones, reglas de cancelación, cupo, reembolso, puntuaciones, etc. |
| Controller | `controller/` | Adaptación HTTP → Service → JSON. Sin lógica de negocio ni async. |
| Route | `route/` | Enlaza URL y método con el controlador. |
| Middleware | `middleware/` | `errorHandler` central que transforma errores a JSON con estado HTTP. |
| Errors | `errors/` | Clases tipificadas (`AppError`, `ValidationError`, `NotFoundError`, `BusinessRuleError`, `AuthorizationError`). |

## Formato de respuestas de error

Todas las respuestas de error siguen este formato:

```json
{
  "error": true,
  "message": "Descripción del error",
  "code": "VALIDATION_ERROR | NOT_FOUND | CONFLICT | FORBIDDEN | INTERNAL_ERROR"
}
```

Códigos de estado HTTP y cuándo aplican:

| Código | Significado | Cuándo se usa |
| --- | --- | --- |
| `200` | OK | Solicitud exitosa (GET, PUT). |
| `201` | Created | Recurso creado exitosamente (POST). |
| `400` | Bad Request | Datos inválidos, campos faltantes o regla de negocio no cumplida (`ValidationError`). |
| `403` | Forbidden | El usuario no tiene permiso para realizar la acción (`AuthorizationError`). |
| `404` | Not Found | El recurso solicitado no existe (`NotFoundError`). |
| `409` | Conflict | Conflicto de negocio (ej. cupo insuficiente, no se puede cancelar) (`BusinessRuleError`). |
| `500` | Internal Server Error | Error inesperado del servidor. |

## Enumeraciones

### `EstadoCompra`

Estado de una compra a lo largo de su vida útil.

| Valor | Significado |
| --- | --- |
| `PENDIENTE` | Se creó la compra pero el pago no confirmó. |
| `CONFIRMADA` | Se confirmó el pago (simulado). |
| `UTILIZADA` | El comprador asistió y usó la entrada. |
| `CANCELADA` | La compra fue cancelada por las reglas de negocio. |
| `REEMBOLSADA` | El comprador solicitó un reembolso. |

Estos valores se usan en:

- `Compra.estado`
- `CambioEstadoCompra.estado` (historial de transiciones)

---

## Endpoints

### 1. Categorías

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/categorias` | Listar todas las categorías. |
| POST | `/categorias` | Crear una nueva categoría. |

#### `GET /categorias`

**200 OK** — Lista de categorías.

```json
[
  { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" },
  { "id": 2, "nombre": "Teatro", "descripcion": "Poesía, comedia y espectáculos" }
]
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /categorias`

Cuerpo:

```json
{ "nombre": "Deportes", "descripcion": "Eventos deportivos" }
```

**201 Created** — Categoría creada.

```json
{ "id": 3, "nombre": "Deportes", "descripcion": "Eventos deportivos" }
```

**400 Bad Request** — `nombre` o `descripcion` faltantes o vacíos.

```json
{ "error": true, "message": "nombre y descripcion son requeridos", "code": "VALIDATION_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

### 2. Usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/usuarios` | Crear un usuario. |
| POST | `/usuarios/{usuarioId}/favoritos` | Agregar un evento a los favoritos de un usuario. |
| GET | `/usuarios/{usuarioId}/compras` | Listar las compras de un usuario. |

#### `POST /usuarios`

Cuerpo:

```json
{ "nombre": "Ana", "apellido": "Gutiérrez" }
```

**201 Created** — Usuario creado.

```json
{ "id": 1, "nombre": "Ana", "apellido": "Gutiérrez", "favoritos": [] }
```

**400 Bad Request** — `nombre` o `apellido` faltantes o vacíos.

```json
{ "error": true, "message": "nombre y apellido son requeridos", "code": "VALIDATION_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /usuarios/{usuarioId}/favoritos`

Cuerpo:

```json
{ "eventoId": 2 }
```

**200 OK** — Evento agregado a favoritos.

```json
{ "id": 1, "nombre": "Ana", "apellido": "Gutiérrez", "favoritos": [2] }
```

**400 Bad Request** — `eventoId` faltante o inválido.

```json
{ "error": true, "message": "eventoId es requerido", "code": "VALIDATION_ERROR" }
```

**404 Not Found** — Usuario o evento no encontrado.

```json
{ "error": true, "message": "Usuario no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `GET /usuarios/{usuarioId}/compras`

**200 OK** — Lista de compras del usuario.

```json
[
  {
    "id": 1,
    "comprador": { "id": 1, "nombre": "Ana", "apellido": "Gutiérrez" },
    "evento": { "id": 2, "nombre": "Confeti Fest", "fecha": "2026-10-20T20:00:00.000Z" },
    "tipoEntrada": { "id": 1, "nombre": "VIP", "precio": 2500, "cupo": 50 },
    "cantidad": 2,
    "total": 5000,
    "estado": "CONFIRMADA",
    "diasFaltantes": 4,
    "historial": [
      { "id": 1, "estado": "PENDIENTE", "quien": "Sistema", "fechaHora": "2026-10-16T10:00:00.000Z" },
      { "id": 2, "estado": "CONFIRMADA", "quien": "Sistema", "fechaHora": "2026-10-16T10:05:00.000Z" }
    ]
  }
]
```

**404 Not Found** — Usuario no encontrado.

```json
{ "error": true, "message": "Usuario no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

### 3. Eventos

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos` | Listar eventos (con filtros: texto, categoriaId, orden). |
| GET | `/eventos/{eventoId}` | Obtener detalle de un evento. |
| POST | `/eventos` | Crear un evento con sus tipos de entrada. |

#### `GET /eventos`

Query params opcionales: `texto`, `categoriaId`, `orden` (precio, fecha, puntajeOrganizador).

**200 OK** — Lista de eventos filtrados y ordenados.

```json
[
  {
    "id": 1,
    "nombre": "Confeti Fest",
    "descripcion": "Festival de confeti",
    "fecha": "2026-10-20T20:00:00.000Z",
    "categoria": { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" },
    "organizador": { "id": 1, "nombre": "Organizador 1", "apellido": "Apellido" },
    "multimedia": ["https://ejemplo.com/confeti.jpg"],
    "tiposEntrada": [
      { "id": 1, "nombre": "General", "precio": 1000, "cupo": 100 },
      { "id": 2, "nombre": "VIP", "precio": 2500, "cupo": 50 }
    ]
  }
]
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `GET /eventos/{eventoId}`

**200 OK** — Detalle del evento.

```json
{
  "id": 1,
  "nombre": "Confeti Fest",
  "descripcion": "Festival de confeti",
  "fecha": "2026-10-20T20:00:00.000Z",
  "categoria": { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" },
  "organizador": { "id": 1, "nombre": "Organizador 1", "apellido": "Apellido" },
  "multimedia": ["https://ejemplo.com/confeti.jpg"],
  "tiposEntrada": [
    { "id": 1, "nombre": "General", "precio": 1000, "cupo": 100 },
    { "id": 2, "nombre": "VIP", "precio": 2500, "cupo": 50 }
  ]
}
```

**404 Not Found** — Evento no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /eventos`

Cuerpo:

```json
{
  "nombre": "Concierto Rock",
  "descripcion": "Concierto de rock nacional",
  "fecha": "2026-11-05T21:00:00.000Z",
  "categoriaId": 1,
  "organizadorId": 1,
  "multimedia": ["https://ejemplo.com/rock.jpg"],
  "tiposEntrada": [
    { "nombre": "General", "descripcion": "Campo", "precio": 2000, "cupo": 200 },
    { "nombre": "VIP", "descripcion": "Platea preferencial", "precio": 5000, "cupo": 100 }
  ]
}
```

**201 Created** — Evento creado.

```json
{
  "id": 2,
  "nombre": "Concierto Rock",
  "descripcion": "Concierto de rock nacional",
  "fecha": "2026-11-05T21:00:00.000Z",
  "categoria": { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" },
  "organizador": { "id": 1, "nombre": "Organizador 1", "apellido": "Apellido" },
  "multimedia": ["https://ejemplo.com/rock.jpg"],
  "tiposEntrada": [
    { "id": 3, "nombre": "General", "descripcion": "Campo", "precio": 2000, "cupo": 200 },
    { "id": 4, "nombre": "VIP", "descripcion": "Platea preferencial", "precio": 5000, "cupo": 100 }
  ]
}
```

**400 Bad Request** — Campos faltantes o inválidos (nombre, fecha, categoriaId, organizadorId).

```json
{ "error": true, "message": "nombre, descripcion, fecha, categoriaId y organizadorId son requeridos", "code": "VALIDATION_ERROR" }
```

**404 Not Found** — Categoría u organizador no encontrado.

```json
{ "error": true, "message": "Categoría no encontrada", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.


### 4. Tipos de Entrada

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos/{eventoId}/tipos-entrada` | Listar tipos de entrada de un evento. |
| POST | `/eventos/{eventoId}/tipos-entrada` | Crear un tipo de entrada para un evento. |

#### `GET /eventos/{eventoId}/tipos-entrada`

**200 OK** — Lista de tipos de entrada del evento.

```json
[
  { "id": 1, "nombre": "General", "descripcion": "Campo", "precio": 1000, "cupo": 100 },
  { "id": 2, "nombre": "VIP", "descripcion": "Platea preferencial", "precio": 2500, "cupo": 50 }
]
```

**404 Not Found** — Evento no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /eventos/{eventoId}/tipos-entrada`

Cuerpo:

```json
{ "nombre": "Platea", "descripcion": "Platea baja", "precio": 3500, "cupo": 80 }
```

**201 Created** — Tipo de entrada creado.

```json
{ "id": 3, "nombre": "Platea", "descripcion": "Platea baja", "precio": 3500, "cupo": 80 }
```

**400 Bad Request** — Campos faltantes o inválidos (nombre, precio, cupo).

```json
{ "error": true, "message": "nombre, descripcion, precio y cupo son requeridos", "code": "VALIDATION_ERROR" }
```

**404 Not Found** — Evento no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.


### 5. Compras

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/compras` | Crear una compra. |
| PUT | `/compras/{compraId}/confirmar` | Confirmar una compra (simula pago). |
| PUT | `/compras/{compraId}/utilizar` | Marcar compra como utilizada. |
| PUT | `/compras/{compraId}/cancelar` | Cancelar compra (prepara reembolso). |
| PUT | `/compras/{compraId}/reembolsar` | Reembolsar compra. |
| GET | `/compras/usuario/{usuarioId}` | Ver compras de un usuario. |
| GET | `/compras/evento/{eventoId}` | Ver compras de un evento y disponibilidad. |
| GET | `/tipos-entrada/{tipoEntradaId}/disponibilidad` | Ver disponibilidad de un tipo de entrada. |

#### `POST /compras`

Cuerpo:

```json
{
  "compradorId": 1,
  "eventoId": 1,
  "tipoEntradaId": 1,
  "cantidad": 2
}
```

**201 Created** — Compra creada.

```json
{
  "id": 1,
  "comprador": { "id": 1, "nombre": "Ana", "apellido": "Gutiérrez" },
  "evento": { "id": 1, "nombre": "Confeti Fest", "fecha": "2026-10-20T20:00:00.000Z" },
  "tipoEntrada": { "id": 1, "nombre": "General", "precio": 1000, "cupo": 100 },
  "cantidad": 2,
  "total": 2000,
  "estado": "PENDIENTE",
  "diasFaltantes": 4,
  "historial": [
    { "id": 1, "estado": "PENDIENTE", "quien": "Sistema", "fechaHora": "2026-10-16T10:00:00.000Z" }
  ]
}
```

**400 Bad Request** — Cantidad inválida (≤ 0) o campos faltantes.

```json
{ "error": true, "message": "cantidad debe ser mayor a 0", "code": "VALIDATION_ERROR" }
```

**404 Not Found** — Comprador, evento o tipo de entrada no encontrado.

```json
{ "error": true, "message": "Tipo de entrada no encontrado", "code": "NOT_FOUND" }
```

**409 Conflict** — Cupo insuficiente.

```json
{ "error": true, "message": "No hay cupo suficiente para la cantidad solicitada", "code": "CONFLICT" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/confirmar`

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Estado actualizado a `CONFIRMADA`.

```json
{ "id": 1, "estado": "CONFIRMADA", "mensaje": "Compra confirmada" }
```

**400 Bad Request** — `usuarioId` faltante.

```json
{ "error": true, "message": "usuarioId es requerido", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no es el comprador de la compra.

```json
{ "error": true, "message": "Solo el comprador puede confirmar la compra", "code": "FORBIDDEN" }
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra ya está confirmada o no se puede confirmar en su estado actual.

```json
{ "error": true, "message": "La compra no puede ser confirmada", "code": "CONFLICT" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/utilizar`

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Estado actualizado a `UTILIZADA`.

```json
{ "id": 1, "estado": "UTILIZADA", "mensaje": "Compra marcada como utilizada" }
```

**400 Bad Request** — `usuarioId` faltante.

```json
{ "error": true, "message": "usuarioId es requerido", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no es el comprador de la compra.

```json
{ "error": true, "message": "Solo el comprador puede utilizar la compra", "code": "FORBIDDEN" }
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra no está en estado `CONFIRMADA`.

```json
{ "error": true, "message": "La compra no puede ser utilizada", "code": "CONFLICT" }
```

**500 Internal Server Error** — Error inesperado del servidor.


#### `PUT /compras/{compraId}/cancelar`

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Estado actualizado a `CANCELADA`.

```json
{ "id": 1, "estado": "CANCELADA", "mensaje": "Compra cancelada" }
```

**400 Bad Request** — `usuarioId` faltante.

```json
{ "error": true, "message": "usuarioId es requerido", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no es el comprador de la compra.

```json
{ "error": true, "message": "Solo el comprador puede cancelar la compra", "code": "FORBIDDEN" }
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra ya está `UTILIZADA` o el evento ya pasó.

```json
{ "error": true, "message": "La compra no puede ser cancelada", "code": "CONFLICT" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/reembolsar`

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Estado actualizado a `REEMBOLSADA`.

```json
{ "id": 1, "estado": "REEMBOLSADA", "mensaje": "Compra reembolsada" }
```

**400 Bad Request** — `usuarioId` faltante.

```json
{ "error": true, "message": "usuarioId es requerido", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no es el comprador de la compra.

```json
{ "error": true, "message": "Solo el comprador puede solicitar reembolso", "code": "FORBIDDEN" }
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra no está en estado `CONFIRMADA` o `CANCELADA`.

```json
{ "error": true, "message": "Solo se reembolsan compras canceladas o confirmadas", "code": "CONFLICT" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `GET /compras/usuario/{usuarioId}`

**200 OK** — Lista de compras del usuario con estado y días faltantes.

```json
[
  {
    "id": 1,
    "evento": { "id": 1, "nombre": "Confeti Fest", "fecha": "2026-10-20T20:00:00.000Z" },
    "tipoEntrada": { "id": 1, "nombre": "General", "precio": 1000 },
    "cantidad": 2,
    "total": 2000,
    "estado": "CONFIRMADA",
    "diasFaltantes": 4
  }
]
```

**404 Not Found** — Usuario no encontrado.

```json
{ "error": true, "message": "Usuario no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `GET /compras/evento/{eventoId}`

**200 OK** — Compras del evento y disponibilidad por tipo de entrada.

```json
{
  "compras": [
    {
      "id": 1,
      "comprador": { "id": 1, "nombre": "Ana", "apellido": "Gutiérrez" },
      "tipoEntrada": { "id": 1, "nombre": "General", "precio": 1000 },
      "cantidad": 2,
      "estado": "CONFIRMADA"
    }
  ],
  "disponibilidad": [
    { "tipoEntradaId": 1, "nombre": "General", "disponibles": 98 },
    { "tipoEntradaId": 2, "nombre": "VIP", "disponibles": 50 }
  ]
}
```

**404 Not Found** — Evento no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `GET /tipos-entrada/{tipoEntradaId}/disponibilidad`

**200 OK** — Disponibilidad de un tipo de entrada.

```json
{ "tipoEntradaId": 1, "nombre": "General", "cupo": 100, "vendidas": 2, "disponibles": 98 }
```

**404 Not Found** — Tipo de entrada no encontrado.

```json
{ "error": true, "message": "Tipo de entrada no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.


### 6. Mensajes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/compras/{compraId}/mensajes` | Leer mensajes de una compra. |
| POST | `/compras/{compraId}/mensajes` | Enviar mensaje en una compra. |
| POST | `/compras/{compraId}/mensajes/{mensajeId}/responder` | Responder a un mensaje. |

#### `GET /compras/{compraId}/mensajes`

**200 OK** — Lista de mensajes de la compra.

```json
[
  {
    "id": 1,
    "usuario": { "id": 1, "nombre": "Ana", "apellido": "Gutiérrez" },
    "texto": "Hola, ¿podemos confirmar la compra?",
    "enviado": "2026-10-16T10:00:00.000Z",
    "respondeA": null
  },
  {
    "id": 2,
    "usuario": { "id": 2, "nombre": "Organizador", "apellido": "Uno" },
    "texto": "Sí, confirmo para el sábado.",
    "enviado": "2026-10-16T10:05:00.000Z",
    "respondeA": 1
  }
]
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /compras/{compraId}/mensajes`

Cuerpo:

```json
{ "texto": "Hola, ¿podemos confirmar la compra?" }
```

**201 Created** — Mensaje enviado.

```json
{
  "id": 1,
  "usuario": { "id": 1, "nombre": "Ana", "apellido": "Gutiérrez" },
  "texto": "Hola, ¿podemos confirmar la compra?",
  "enviado": "2026-10-16T10:00:00.000Z",
  "respondeA": null
}
```

**400 Bad Request** — `texto` faltante o vacío.

```json
{ "error": true, "message": "texto es requerido", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no es el comprador ni el organizador de la compra.

```json
{ "error": true, "message": "No tienes permiso para enviar mensajes en esta compra", "code": "FORBIDDEN" }
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /compras/{compraId}/mensajes/{mensajeId}/responder`

Cuerpo:

```json
{ "texto": "Sí, confirmo para el sábado." }
```

**201 Created** — Mensaje de respuesta enviado.

```json
{
  "id": 2,
  "usuario": { "id": 2, "nombre": "Organizador", "apellido": "Uno" },
  "texto": "Sí, confirmo para el sábado.",
  "enviado": "2026-10-16T10:05:00.000Z",
  "respondeA": 1
}
```

**400 Bad Request** — `texto` faltante o vacío.

```json
{ "error": true, "message": "texto es requerido", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no es el organizador de la compra.

```json
{ "error": true, "message": "Solo el organizador puede responder mensajes", "code": "FORBIDDEN" }
```

**404 Not Found** — Compra o mensaje no encontrado.

```json
{ "error": true, "message": "Compra o mensaje no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.


### 7. Reseñas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos/{eventoId}/resenas` | Ver reseñas de un evento. |
| POST | `/eventos/{eventoId}/resenas` | Crear una reseña para un evento. |

#### `GET /eventos/{eventoId}/resenas`

**200 OK** — Lista de reseñas del evento.

```json
[
  {
    "id": 1,
    "comprador": { "id": 1, "nombre": "Ana", "apellido": "Gutiérrez" },
    "puntuacion": 5,
    "detalle": "Excelente presentación",
    "fecha": "2026-10-21T10:00:00.000Z"
  }
]
```

**404 Not Found** — Evento no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /eventos/{eventoId}/resenas`

Cuerpo:

```json
{ "compradorId": 1, "detalle": "Excelente presentación", "puntuacion": 5 }
```

**201 Created** — Reseña creada.

```json
{ "id": 1, "compradorId": 1, "eventoId": 1, "puntuacion": 5, "detalle": "Excelente presentación" }
```

**400 Bad Request** — Campos faltantes o puntuación fuera de rango (1-5).

```json
{ "error": true, "message": "puntuacion debe ser un número entre 1 y 5", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El comprador no tiene una compra `UTILIZADA` para este evento.

```json
{ "error": true, "message": "Solo se puede calificar si la entrada fue utilizada", "code": "FORBIDDEN" }
```

**404 Not Found** — Evento o comprador no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

### 8. Puntaje del Organizador

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/organizadores/{organizadorId}/puntaje` | Promedio de puntuación de los eventos del organizador. |

#### `GET /organizadores/{organizadorId}/puntaje`

**200 OK** — Puntaje promedio del organizador.

```json
{ "organizadorId": 1, "puntajePromedio": 4.5, "totalResenas": 10 }
```

**404 Not Found** — Organizador no encontrado.

```json
{ "error": true, "message": "Organizador no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

## Validaciones de negocio principales

1. **Cupo**: no se puede vender más entradas de las disponibles.
2. **Estado de compra**:
   - Se puede cancelar solo si no está `UTILIZADA` y el evento aún no comenzó.
   - Se puede reembolsar solo desde `CONFIRMADA` o `CANCELADA`.
   - Se puede confirmar solo si está `PENDIENTE`.
   - Se puede marcar como utilizada solo si está `CONFIRMADA`.
3. **Reseña**: solo si el comprador tiene una compra `UTILIZADA` para ese evento.
4. **Favoritos**: el usuario puede tener múltiples favoritos.
5. **Chat**: solo el comprador y el organizador de la compra pueden enviar mensajes; solo el organizador puede responder.

## Tests

Para ejecutar las pruebas de dominio y de servicio:

```bash
cd packages/backend
npm i
npm test
```

Se ejecutan con `node --test` sobre los archivos en `tests/domain/` y `tests/service/`.

## Documentación Swagger

La documentación interactiva está disponible en:

```
http://localhost:3000/api-docs
```

Los archivos de referencia de la documentación local están en:

```
packages/backend/docs/
  swagger.js
  api/
    categorias.api.yaml
    eventos.api.yaml
    usuarios.api.yaml
    compras.api.yaml
    mensajes.api.yaml
    reseñas.api.yaml
    tiposEntrada.api.yaml
    enums.api.yaml
```

## Estructura del proyecto

```text
packages/backend/
+-- domain/                  # Entidades del dominio
+-- repository/              # Implementaciones en memoria
+-- service/                 # Lógica de negocio
+-- controller/              # Controladores HTTP
+-- route/                   # Definición de rutas
+-- middleware/              # Manejador de errores
+-- errors/                  # Errores tipificados
+-- tests/                   # Pruebas de dominio y servicio
+-- docs/
   +-- swagger.js
   +-- api/                  # Documentación de rutas
+-- index.js                  # Punto de entrada
+-- package.json
```