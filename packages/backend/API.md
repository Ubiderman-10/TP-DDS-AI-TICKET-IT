# API REST - AI Ticket It (Backend)

## Contexto del trabajo práctico

Plataforma para **venta de entradas a eventos** (recitales, conciertos, teatro, deportes, etc.).

- **Organizador**: publica eventos con descripción, fecha, multimedia; define **tipos de entrada** con precio y cupo; monitorea compras y disponibilidad.
- **Comprador**: busca eventos por texto o categoría, ordena por precio/fecha/puntuación; **compra** entradas respetando cupos; **cancela** si la compra no está usada y el evento no comenzó; **reseña** un evento cuando la entrada está **utilizada**.

La API REST está definida bajo la base `http://localhost:3000/api`.

Cada `Usuario` tiene un **rol** (`ORGANIZADOR`, `COMPRADOR` o `AMBOS`) que define qué puede hacer. Ver la sección *Roles y permisos*.

## Información general

| Aspecto | Detalle |
| --- | --- |
| Entorno | `http://localhost:3000/api` |
| Documentación interactiva | No disponible: Swagger no está conectado a la app (ver *Documentación Swagger*). Esta guía es la referencia. |
| Gitignore recomendado | `node_modules`, `*.log`, `.env` |
| Persistencia | En memoria (arrays) en `repository/`. Al reiniciar el servidor se pierden los datos. |
| Datos de ejemplo | `npm start` carga `seed.js` (usuarios, categorías y eventos de prueba). Los tests no lo usan. |

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

## Formato de respuestas exitosas

Todas las respuestas exitosas envuelven el contenido en la propiedad `data`:

```json
{ "data": { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" } }
```

Los ejemplos de este documento muestran **solo el contenido de `data`** para abreviar.

## Formato de respuestas de error

Todas las respuestas de error siguen este formato:

```json
{
  "error": true,
  "message": "Descripción del error",
  "code": "VALIDATION_ERROR | NOT_FOUND | BUSINESS_RULE_ERROR | AUTHORIZATION_ERROR | INTERNAL_ERROR"
}
```

Códigos de estado HTTP y cuándo aplican:

| Código | Significado | Cuándo se usa |
| --- | --- | --- |
| `200` | OK | Solicitud exitosa (GET, PUT). |
| `201` | Created | Recurso creado exitosamente (POST). |
| `400` | Bad Request | Datos inválidos o campos faltantes (`ValidationError`, código `VALIDATION_ERROR`). |
| `403` | Forbidden | El usuario no tiene permiso: su rol o su relación con el evento o la compra no se lo permite (`AuthorizationError`, código `AUTHORIZATION_ERROR`). |
| `404` | Not Found | El recurso solicitado no existe (`NotFoundError`, código `NOT_FOUND`). |
| `409` | Conflict | Regla de negocio no cumplida, por ejemplo cupo insuficiente o transición de estado inválida (`BusinessRuleError`, código `BUSINESS_RULE_ERROR`). |
| `500` | Internal Server Error | Error inesperado del servidor. |

## Enumeraciones

### `EstadoCompra`

Estado de una compra a lo largo de su vida útil.

| Valor | Significado |
| --- | --- |
| `Pendiente` | Se creó la compra pero el pago no se confirmó. |
| `Confirmada` | Se confirmó el pago (simulado). |
| `Utilizada` | La entrada fue usada en el evento. |
| `Cancelada` | La compra fue cancelada. |
| `Reembolsada` | Se reembolsó una compra cancelada. |

Los valores se serializan tal cual en el JSON (por ejemplo `"estado": "Pendiente"`).

Estos valores se usan en:

- `Compra.estado`
- `CambioEstadoCompra.estado` (historial de transiciones)

### `RolUsuario`

| Valor | Significado |
| --- | --- |
| `ORGANIZADOR` | Publica eventos y gestiona sus ventas. No puede comprar entradas ni guardar favoritos. |
| `COMPRADOR` | Explora eventos, compra entradas, guarda favoritos y reseña. No puede crear eventos. |
| `AMBOS` | Puede hacer las dos cosas (valor por defecto al crear un usuario sin indicar rol). No puede comprar entradas de sus propios eventos. |

## Roles y permisos

| Acción | Quién puede hacerla | Error si no |
| --- | --- | --- |
| Crear un evento | Usuario con rol `ORGANIZADOR` o `AMBOS` | `403` |
| Comprar entradas | Usuario con rol `COMPRADOR` o `AMBOS`, que no sea el organizador del evento | `403` (rol) o `409` (evento propio) |
| Guardar favoritos | Usuario con rol `COMPRADOR` o `AMBOS` | `403` |
| Confirmar el pago | El comprador de la compra o el organizador del evento | `403` |
| Marcar la entrada como utilizada | Solo el organizador del evento | `403` |
| Cancelar una compra | Solo el comprador de la compra | `403` |
| Reembolsar una compra | El comprador de la compra o el organizador del evento | `403` |
| Escribir en el chat de una compra | El comprador de la compra o el organizador del evento | `403` |

El diagrama de clases tentativo define un único `Usuario` sin rol. Se agregó el atributo `rol` para separar las funcionalidades del organizador y del comprador; el valor `AMBOS` mantiene la posibilidad de un usuario con múltiples roles.

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
{ "error": true, "message": "La categoria debe tener nombre y descripcion", "code": "VALIDATION_ERROR" }
```

**400 Bad Request** — Ya existe una categoría con ese nombre (se compara sin distinguir mayúsculas ni espacios).

```json
{ "error": true, "message": "Ya existe una categoria con ese nombre", "code": "VALIDATION_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

### 2. Usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/usuarios` | Listar todos los usuarios. |
| GET | `/usuarios/{usuarioId}` | Obtener un usuario. |
| POST | `/usuarios` | Crear un usuario. |
| POST | `/usuarios/{usuarioId}/favoritos` | Agregar un evento a los favoritos de un usuario (solo compradores). |
| DELETE | `/usuarios/{usuarioId}/favoritos/{eventoId}` | Quitar un evento de los favoritos. |
| GET | `/usuarios/{usuarioId}/compras` | Listar las compras de un usuario. |

#### `GET /usuarios`

**200 OK** — Lista de usuarios con su rol y los ids de sus eventos favoritos.

```json
[
  { "id": 1, "nombre": "Ana", "apellido": "Organizadora", "rol": "ORGANIZADOR", "favoritos": [] },
  { "id": 3, "nombre": "Carlos", "apellido": "Comprador", "rol": "COMPRADOR", "favoritos": [2] }
]
```

#### `GET /usuarios/{usuarioId}`

**200 OK** — El usuario.

```json
{ "id": 3, "nombre": "Carlos", "apellido": "Comprador", "rol": "COMPRADOR", "favoritos": [2] }
```

**404 Not Found** — Usuario no encontrado.

```json
{ "error": true, "message": "Usuario no encontrado", "code": "NOT_FOUND" }
```

#### `POST /usuarios`

Cuerpo (`rol` es opcional y vale `AMBOS` si no se envía):

```json
{ "nombre": "Ana", "apellido": "Gutiérrez", "rol": "ORGANIZADOR" }
```

**201 Created** — Usuario creado.

```json
{ "id": 1, "nombre": "Ana", "apellido": "Gutiérrez", "rol": "ORGANIZADOR", "favoritos": [] }
```

**400 Bad Request** — `nombre` o `apellido` faltantes, o `rol` inválido.

```json
{ "error": true, "message": "El nombre y el apellido son obligatorios", "code": "VALIDATION_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /usuarios/{usuarioId}/favoritos`

Cuerpo:

```json
{ "eventoId": 2 }
```

**200 OK** — Evento agregado a favoritos (si ya estaba, no se duplica).

```json
{ "id": 3, "nombre": "Carlos", "apellido": "Comprador", "rol": "COMPRADOR", "favoritos": [2] }
```

**403 Forbidden** — El usuario no tiene rol de comprador.

```json
{ "error": true, "message": "Solo los compradores pueden guardar favoritos", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Usuario o evento no encontrado (también si falta `eventoId`).

```json
{ "error": true, "message": "Usuario no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `DELETE /usuarios/{usuarioId}/favoritos/{eventoId}`

**200 OK** — Devuelve el usuario sin ese favorito.

```json
{ "id": 3, "nombre": "Carlos", "apellido": "Comprador", "rol": "COMPRADOR", "favoritos": [] }
```

**404 Not Found** — Usuario o evento no encontrado.

#### `GET /usuarios/{usuarioId}/compras`

**200 OK** — Compras del usuario. `diasFaltantes` son los días que faltan para el evento (negativo si ya ocurrió).

```json
[
  {
    "id": 1,
    "evento": { "id": 2, "nombre": "Hamlet", "fecha": "2026-11-24T17:58:05.337Z" },
    "tipoEntrada": { "id": 3, "nombre": "Platea" },
    "cantidad": 2,
    "total": 16000,
    "estado": "Confirmada",
    "diasFaltantes": 10
  }
]
```

Si el usuario no existe o no tiene compras, devuelve una lista vacía.

**500 Internal Server Error** — Error inesperado del servidor.

### 3. Eventos

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos` | Listar eventos (con filtros: texto, categoriaId, orden y dirección). |
| GET | `/eventos/{eventoId}` | Obtener detalle de un evento. |
| POST | `/eventos` | Crear un evento con sus tipos de entrada. |

#### `GET /eventos`

Query params opcionales:

| Parámetro | Valores | Descripción |
| --- | --- | --- |
| `texto` | texto libre | Filtra por nombre o descripción. |
| `categoriaId` | id de categoría | Filtra por categoría. |
| `orden` | `precio`, `fecha`, `puntajeOrganizador` | Criterio de orden (`precio` usa el tipo de entrada más barato). |
| `direccion` | `asc`, `desc` | Sentido del orden. Si se omite: `precio` y `fecha` ascendente (más barato y más próximo primero) y `puntajeOrganizador` descendente. |

**200 OK** — Lista de eventos filtrados y ordenados.

```json
[
  {
    "id": 1,
    "nombre": "Confeti Fest",
    "descripcion": "Festival de confeti",
    "fecha": "2026-12-20T20:00:00.000Z",
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
  "fecha": "2026-12-20T20:00:00.000Z",
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
  "fecha": "2026-12-05T21:00:00.000Z",
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
  "fecha": "2026-12-05T21:00:00.000Z",
  "categoria": { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" },
  "organizador": { "id": 1, "nombre": "Organizador 1", "apellido": "Apellido" },
  "multimedia": ["https://ejemplo.com/rock.jpg"],
  "tiposEntrada": [
    { "id": 3, "nombre": "General", "descripcion": "Campo", "precio": 2000, "cupo": 200 },
    { "id": 4, "nombre": "VIP", "descripcion": "Platea preferencial", "precio": 5000, "cupo": 100 }
  ]
}
```

**400 Bad Request** — Campos faltantes o inválidos (nombre, descripción, fecha válida y futura; precio finito mayor a 0 y cupo entero mayor a 0 para cada tipo de entrada).

```json
{ "error": true, "message": "El Evento debe tener un nombre y una descripción", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario no tiene rol de organizador.

```json
{ "error": true, "message": "Solo un organizador puede crear eventos", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Categoría u organizador no encontrado.

```json
{ "error": true, "message": "Categoria no encontrada", "code": "NOT_FOUND" }
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

**400 Bad Request** — Campos faltantes o inválidos (nombre, precio finito mayor a 0 y cupo entero mayor a 0).

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
| PUT | `/compras/{compraId}/confirmar` | Confirmar una compra (simula pago). Comprador u organizador. |
| PUT | `/compras/{compraId}/utilizar` | Marcar compra como utilizada. Solo el organizador del evento. |
| PUT | `/compras/{compraId}/cancelar` | Cancelar compra. Solo el comprador. |
| PUT | `/compras/{compraId}/reembolsar` | Reembolsar una compra cancelada. Comprador u organizador. |
| GET | `/usuarios/{usuarioId}/compras` | Ver compras de un usuario (documentado en *Usuarios*). |
| GET | `/eventos/{eventoId}/compras` | Ver compras de un evento y disponibilidad. |
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

**201 Created** — Compra creada en estado `Pendiente`.

```json
{
  "id": 1,
  "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
  "evento": { "id": 2, "nombre": "Hamlet", "fecha": "2026-11-24T17:58:05.337Z" },
  "tipoEntrada": { "id": 3, "nombre": "Platea", "precio": 8000, "cupo": 50 },
  "cantidad": 2,
  "total": 16000,
  "estado": "Pendiente"
}
```

**400 Bad Request** — Cantidad inválida (debe ser un entero mayor a 0) o campos faltantes.

```json
{ "error": true, "message": "La cantidad debe ser mayor a 0", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El usuario tiene rol `ORGANIZADOR`.

```json
{ "error": true, "message": "Un organizador no puede comprar entradas", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Comprador, evento o tipo de entrada no encontrado.

```json
{ "error": true, "message": "Tipo de entrada no encontrado", "code": "NOT_FOUND" }
```

**409 Conflict** — Cupo insuficiente, o el comprador es el organizador del evento (`"No podes comprar entradas de tu propio evento"`).

```json
{ "error": true, "message": "No hay cupo suficiente. Disponibles: 48", "code": "BUSINESS_RULE_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/confirmar`

Confirma el pago (simulado). Lo pueden hacer el comprador de la compra o el organizador del evento, y solo si la compra está `Pendiente`.

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Devuelve la compra con `estado: "Confirmada"`.

```json
{
  "id": 1,
  "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
  "evento": { "id": 2, "nombre": "Hamlet", "fecha": "2026-11-24T17:58:05.337Z" },
  "tipoEntrada": { "id": 3, "nombre": "Platea", "precio": 8000, "cupo": 50 },
  "cantidad": 2,
  "total": 16000,
  "estado": "Confirmada"
}
```

**403 Forbidden** — El usuario no es el comprador ni el organizador del evento.

```json
{ "error": true, "message": "Solo el comprador o el organizador pueden confirmar la compra", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Compra o usuario no encontrado (también si falta `usuarioId`).

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra no está `Pendiente`.

```json
{ "error": true, "message": "Solo se puede confirmar una compra pendiente", "code": "BUSINESS_RULE_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/utilizar`

Marca la entrada como usada en el evento. Solo lo puede hacer el organizador del evento, y solo si la compra está `Confirmada`.

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Devuelve la compra con `estado: "Utilizada"`.

```json
{
  "id": 1,
  "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
  "evento": { "id": 2, "nombre": "Hamlet", "fecha": "2026-11-10T17:58:05.337Z" },
  "tipoEntrada": { "id": 3, "nombre": "Platea", "precio": 8000, "cupo": 50 },
  "cantidad": 2,
  "total": 16000,
  "estado": "Utilizada"
}
```

**403 Forbidden** — El usuario no es el organizador del evento.

```json
{ "error": true, "message": "Solo el organizador del evento puede marcar la entrada como utilizada", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Compra o usuario no encontrado (también si falta `usuarioId`).

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra no está `Confirmada` o todavía no llegó la fecha y hora del evento.

```json
{ "error": true, "message": "Solo se puede utilizar una compra confirmada", "code": "BUSINESS_RULE_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/cancelar`

Cancela la compra y libera el cupo. Solo lo puede hacer el comprador, solo si la compra está `Pendiente` o `Confirmada` y el evento todavía no ocurrió.

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Devuelve la compra con `estado: "Cancelada"`.

```json
{
  "id": 1,
  "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
  "evento": { "id": 2, "nombre": "Hamlet", "fecha": "2026-11-24T17:58:05.337Z" },
  "tipoEntrada": { "id": 3, "nombre": "Platea", "precio": 8000, "cupo": 50 },
  "cantidad": 2,
  "total": 16000,
  "estado": "Cancelada"
}
```

**403 Forbidden** — El usuario no es el comprador de la compra.

```json
{ "error": true, "message": "Solo el comprador puede cancelar la compra", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Compra o usuario no encontrado (también si falta `usuarioId`).

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra está `Utilizada`, ya fue cancelada o reembolsada, o el evento ya ocurrió.

```json
{ "error": true, "message": "La compra no puede ser cancelada", "code": "BUSINESS_RULE_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `PUT /compras/{compraId}/reembolsar`

Reembolsa una compra que ya está `Cancelada`. Lo pueden hacer el comprador o el organizador del evento.

Cuerpo:

```json
{ "usuarioId": 1 }
```

**200 OK** — Devuelve la compra con `estado: "Reembolsada"`.

```json
{
  "id": 1,
  "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
  "evento": { "id": 2, "nombre": "Hamlet", "fecha": "2026-11-24T17:58:05.337Z" },
  "tipoEntrada": { "id": 3, "nombre": "Platea", "precio": 8000, "cupo": 50 },
  "cantidad": 2,
  "total": 16000,
  "estado": "Reembolsada"
}
```

**403 Forbidden** — El usuario no es el comprador ni el organizador del evento.

```json
{ "error": true, "message": "Solo el comprador o el organizador pueden reembolsar la compra", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Compra o usuario no encontrado (también si falta `usuarioId`).

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

**409 Conflict** — La compra no está `Cancelada`.

```json
{ "error": true, "message": "Solo se reembolsan compras canceladas", "code": "BUSINESS_RULE_ERROR" }
```

**500 Internal Server Error** — Error inesperado del servidor.

#### `GET /eventos/{eventoId}/compras`

**200 OK** — Compras del evento y disponibilidad por tipo de entrada.

```json
{
  "compras": [
    {
      "id": 1,
      "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
      "tipoEntrada": { "id": 3, "nombre": "Platea" },
      "cantidad": 2,
      "total": 16000,
      "estado": "Confirmada"
    }
  ],
  "disponibilidad": [
    { "tipoEntradaId": 3, "nombre": "Platea", "disponibles": 48 },
    { "tipoEntradaId": 4, "nombre": "Pullman", "disponibles": 30 }
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

Cada compra tiene un chat entre el comprador y el organizador del evento. Se puede escribir **en cualquier estado** de la compra.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/compras/{compraId}/mensajes` | Leer mensajes de una compra. |
| POST | `/compras/{compraId}/mensajes` | Enviar mensaje en una compra. |
| POST | `/compras/{compraId}/mensajes/responder` | Responder a un mensaje anterior. |

#### `GET /compras/{compraId}/mensajes`

**200 OK** — Lista de mensajes de la compra.

```json
[
  {
    "id": 1,
    "emisor": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
    "compraId": 1,
    "texto": "Hola, ¿puedo cambiar la fecha?",
    "enviado": "2026-11-14T17:58:05.435Z",
    "respondeA": null
  },
  {
    "id": 2,
    "emisor": { "id": 1, "nombre": "Ana", "apellido": "Organizadora" },
    "compraId": 1,
    "texto": "Sí, escribime por acá.",
    "enviado": "2026-11-14T17:58:05.441Z",
    "respondeA": 1
  }
]
```

**404 Not Found** — Compra no encontrada.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

#### `POST /compras/{compraId}/mensajes`

Cuerpo:

```json
{ "emisorId": 3, "texto": "Hola, ¿podemos confirmar la compra?" }
```

**201 Created** — Mensaje creado (devuelve el mismo formato que la lista).

**400 Bad Request** — `texto` faltante o vacío.

```json
{ "error": true, "message": "Es necesario enviar un mensaje de tipo String", "code": "VALIDATION_ERROR" }
```

**403 Forbidden** — El emisor no es el comprador ni el organizador de la compra.

```json
{ "error": true, "message": "Solo el comprador y el organizador pueden participar del chat", "code": "AUTHORIZATION_ERROR" }
```

**404 Not Found** — Compra o emisor no encontrado.

```json
{ "error": true, "message": "Compra no encontrada", "code": "NOT_FOUND" }
```

#### `POST /compras/{compraId}/mensajes/responder`

Cuerpo:

```json
{ "emisorId": 1, "texto": "Sí, confirmo para el sábado.", "mensajePadreId": 1 }
```

**201 Created** — Mensaje creado con `respondeA` igual al id del mensaje original.

**400 Bad Request** — `texto` faltante o vacío.

**403 Forbidden** — El emisor no es el comprador ni el organizador de la compra (`"Solo el comprador y el organizador pueden participar del chat"`).

**404 Not Found** — Compra, emisor o mensaje a responder no encontrado.

```json
{ "error": true, "message": "Mensaje a responder no encontrado", "code": "NOT_FOUND" }
```

> La app móvil usa `POST /compras/{compraId}/mensajes` tanto para el comprador como para el organizador; `responder` queda disponible para respuestas encadenadas.

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
    "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
    "evento": { "id": 2, "nombre": "Hamlet" },
    "puntuacion": 5,
    "detalle": "Excelente presentación"
  }
]
```

Si el evento no existe o no tiene reseñas, devuelve una lista vacía.

**500 Internal Server Error** — Error inesperado del servidor.

#### `POST /eventos/{eventoId}/resenas`

Cuerpo:

```json
{ "compradorId": 1, "detalle": "Excelente presentación", "puntuacion": 5 }
```

**201 Created** — Reseña creada.

```json
{
  "id": 1,
  "comprador": { "id": 3, "nombre": "Carlos", "apellido": "Comprador" },
  "evento": { "id": 2, "nombre": "Hamlet" },
  "puntuacion": 5,
  "detalle": "Excelente presentación"
}
```

**400 Bad Request** — Campos faltantes o puntuación fuera de rango (1-5).

```json
{ "error": true, "message": "La puntuacion debe ser un numero entero entre 1 y 5 inclusive", "code": "VALIDATION_ERROR" }
```

**409 Conflict** — El comprador no tiene una compra `Utilizada` para este evento, todavía no llegó la fecha y hora programadas o ya publicó una reseña para el evento.

```json
{ "error": true, "message": "Solo se puede calificar una vez utilizada la entrada", "code": "BUSINESS_RULE_ERROR" }
```

**404 Not Found** — Evento o comprador no encontrado.

```json
{ "error": true, "message": "Evento no encontrado", "code": "NOT_FOUND" }
```

**500 Internal Server Error** — Error inesperado del servidor.

### 8. Organizadores

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/organizadores/{organizadorId}/eventos` | Eventos creados por un organizador. |
| GET | `/organizadores/{organizadorId}/puntaje` | Promedio de puntuación de los eventos del organizador. |

#### `GET /organizadores/{organizadorId}/eventos`

**200 OK** — Lista de eventos del organizador (mismo formato que `GET /eventos`). Si el organizador no existe o no tiene eventos, devuelve una lista vacía.

#### `GET /organizadores/{organizadorId}/puntaje`

**200 OK** — Puntaje promedio de las reseñas de **todos** los eventos del organizador (0 si todavía no tiene reseñas).

```json
{ "organizadorId": 1, "puntaje": 4.5 }
```

> La app usa estos dos endpoints para mostrar, en cada evento, las reseñas de los eventos del organizador y su puntaje, de modo que el comprador conozca experiencias previas antes de comprar.

**500 Internal Server Error** — Error inesperado del servidor.

## Validaciones de negocio principales

1. **Cupo y cantidades**: no se puede vender más entradas de las disponibles; la cantidad debe ser un entero positivo. Una compra cancelada o reembolsada libera su cupo.
2. **Eventos y tipos de entrada**: la fecha del evento debe ser futura; el precio debe ser finito y mayor a 0, y el cupo un entero positivo.
3. **Estado de compra**:
   - Se puede confirmar solo si está `Pendiente` (comprador u organizador).
   - Se puede marcar como utilizada solo si está `Confirmada` y ya llegó la fecha y hora programadas (solo el organizador del evento).
   - Se puede cancelar solo si está `Pendiente` o `Confirmada` y el evento aún no ocurrió (solo el comprador).
   - Se puede reembolsar solo si está `Cancelada` (comprador u organizador).
4. **Roles**: solo un organizador crea eventos; solo un comprador compra y guarda favoritos; nadie compra entradas de su propio evento.
5. **Reseña**: solo si el comprador tiene una compra `Utilizada` para ese evento y ya llegó la fecha y hora programadas. Cada comprador puede dejar una reseña por evento.
6. **Favoritos**: el usuario puede tener múltiples favoritos, sin repetir el mismo evento.
7. **Chat**: solo el comprador y el organizador de la compra pueden escribir, en cualquier estado de la compra.
8. **Categorías**: el nombre no se puede repetir.

## Tests

Para ejecutar las pruebas de dominio y de servicio:

```bash
cd packages/backend
npm i
npm test
```

Se ejecutan con `node --test` (test runner de Node, sin jest) sobre los archivos en `tests/domain/` y `tests/service/`.

Además de los casos de dominio y servicio, hay tests específicos de:

- `tests/domain/RolUsuario.test.js`: roles y validación del rol.
- `tests/service/PermisosPorRol.test.js`: permisos por rol y relación con el evento o la compra, transiciones de estado, cupo, chat y favoritos.
- `tests/service/OrdenamientoEventos.test.js`: orden por precio, fecha y puntaje en ambas direcciones.

## Documentación Swagger

Los archivos de `docs/` (`swagger.js` y `docs/api/*.yaml`) son un borrador y **no están conectados a la app**: `swagger-ui-express` no está instalado y `app.js` no monta `/api-docs`. La referencia vigente de la API es este documento.

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
+-- app.js                    # Composición de dependencias y rutas
+-- seed.js                   # Datos de ejemplo (solo al iniciar con npm start)
+-- index.js                  # Punto de entrada
+-- package.json
```