# API REST - AI Ticket It (Backend)

## Contexto del trabajo próctico

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
| Domain | `src/domain/` | Entidades del modelo: `Usuario`, `Evento`, `Categoria`, `TipoEntrada`, `Compra`, `Mensaje`, `Reseña`, `CambioEstadoCompra`, `EstadoCompra`. Reglas de negocio básicas. |
| Repository | `src/repository/` | Implementación en memoria. Todos los repositorios heredan de `RepositorioEnMemoriaBase` y gestionan arrays. |
| Service | `src/service/` | Lógica de negocio: validaciones, reglas de cancelación, cupo, reembolso, puntuaciones, etc. |
| Controller | `src/controller/` | Adaptación HTTP -> Service -> JSON. Sin lógica de negocio ni async. |
| Route | `src/route/` | Enlaza URL y método con el controlador. |
| Middleware | `src/middleware/` | `errorHandler` central que transforma errores a JSON con estado HTTP. |
| Errors | `src/errors/` | Clases tipificadas (`AppError`, `ValidationError`, `NotFoundError`, `BusinessRuleError`, `AuthorizationError`). |

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

## Endpoints

### 1. Categorías

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/categorias` | Listar categorías. |
| POST | `/categorias` | Crear categoría. |

#### `GET /categorias`

Respuesta **200**:

```json
[
  { "id": 1, "nombre": "Música", "descripcion": "Eventos musicales" },
  { "id": 2, "nombre": "Teatro", "descripcion": "Poesía, comedia y espectculos" }
]
```

#### `POST /categorias`

Cuerpo:

```json
{ "nombre": "Deportes", "descripcion": "Eventos deportivos" }
```

Respuestas:

- `201` : Categoría creada.
- `400` : `nombre` o `descripcion` faltantes.

### 2. Usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/usuarios` | Crear usuario |
| POST | `/usuarios/{usuarioId}/favoritos` | Agregar evento a favoritos |
| GET | `/usuarios/{usuarioId}/compras` | Compras del usuario |

#### `POST /usuarios`

Cuerpo:

```json
{ "nombre": "Ana", "apellido": "Gutiérrez" }
```

Respuesta **201** (ejemplo):

```json
{ "id": 1, "nombre": "Ana", "apellido": "Gutiérrez", "favoritos": [] }
```

#### `POST /usuarios/{usuarioId}/favoritos`

Cuerpo:

```json
{ "eventoId": 2 }
```

#### `GET /usuarios/{usuarioId}/compras`

Retorna las compras del usuario. Incluye estado y días pendientes.

### 3. Eventos

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos` | Listar eventos (filtros y orden) |
| POST | `/eventos` | Crear evento (organizador) |
| GET | `/eventos/:id` | Detalle de un evento |
| GET | `/eventos/:id/compras` | Compras de un evento |
| GET | `/eventos/:id/resenas` | Reseñas del evento |
| GET | `/eventos/:id/tipos-entrada` | Tipos de entrada del evento |

#### `GET /eventos`

Filtros opcionales en query (`texto`, `categoriaId`) y orden.

Ejemplo:

```bash
GET /eventos?texto=rock&orden=fecha
```

#### `POST /eventos`

Cuerpo:

```json
{
  "nombre": "Rock Festival",
  "descripcion": "Festival de rock urbano",
  "fecha": "2026-11-14T20:00:00.000Z",
  "multimedia": ["https://cdn.ejemplo.com/rock.jpg"],
  "organizacionId": 1,
  "categoriaId": 1,
  "tiposEntrada": [
    { "nombre": "General", "descripcion": "Campo", "precio": 1500, "cupo": 100 },
    { "nombre": "VIP", "descripcion": "Ventanilla", "precio": 3500, "cupo": 20 }
  ]
}
```

#### `GET /eventos/:id`

Devuelve el evento con información de categoría, organizador, tipos de entrada, etc.

### 4. Tipos de entrada

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos/:id/tipos-entrada` | Listar tipos de un evento |
| POST | `/eventos/:id/tipos-entrada` | Crear tipo de entrada |

#### `POST /eventos/{id}/tipos-entrada`

Cuerpo:

```json
{
  "nombre": "Platea",
  "descripcion": "Ventanilla",
  "precio": 2500,
  "cupo": 40
}
```

### 5. Compras

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/compras` | Crear compra |
| GET | `/compras/usuario/:id` | Compras del usuario |
| GET | `/compras/evento/:id` | Compras del evento + disponibilidad |
| PUT | `/compras/:id/confirmar` | Confirmar compra |
| PUT | `/compras/:id/utilizar` | Marcar como utilizada |
| PUT | `/compras/:id/cancelar` | Cancelar compra |
| PUT | `/compras/:id/reembolsar` | Reembolso |
| GET | `/compras/:id/historial` | Historial de cambios |
| GET | `/compras` | Listar compras |

#### `POST /compras`

Cuerpo:

```json
{
  "compradorId": 1,
  "eventoId": 2,
  "tipoEntradaId": 1,
  "cantidad": 2
}
```

Validaciones:

- El comprador y el evento deben existir.
- La cantidad debe ser mayor a 0.
- No se puede vender más que el cupo disponible.

#### `PUT /compras/:id/confirmar`

Cuerpo:

```json
{ "usuarioId": 1 }
```

#### `PUT /compras/:id/cancelar`

Cuerpo:

```json
{ "usuarioId": 1 }
```

Regla: solo se puede cancelar si la compra no está **UTILIZADA** y el evento aún no pasó.

#### `PUT /compras/:id/reembolsar`

Reembolso mediante estado `REEMBOLSADA`.

### 6. Mensajes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/compras/:id/mensajes` | Leer mensajes de una compra |
| POST | `/compras/:id/mensajes` | Enviar mensaje |
| POST | `/compras/:id/mensajes/{mensajeId}/responder` | Responder mensaje |

#### `POST /compras/:id/mensajes`

Cuerpo:

```json
{ "texto": "Hola, podemos confirmar la compra?" }
```

#### `POST /compras/:id/mensajes/{mensajeId}/responder`

Cuerpo:

```json
{ "texto": "Sí, confirmo." }
```

### 7. Reseñas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/eventos/:id/resenas` | Ver reseñas del evento |
| POST | `/eventos/:id/resenas` | Crear reseña |

#### `POST /eventos/{id}/resenas`

Cuerpo:

```json
{
  "compradorId": 1,
  "detalle": "Excelente presentación",
  "puntuacion": 5
}
```

Validación: solo si la compra está **UTILIZADA**.

#### `GET /eventos/:id/resenas`

Devuelve las reseñas del evento.

### 8. Puntaje del Organizador

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/organizadores/:organizadorId/puntaje` | Promedio de puntuación de los eventos del organizador |

## Validaciones de negocio principales

1. **Cupo**: no se puede vender más entradas de las disponibles.
2. **Estado de compra**:
   - Se puede cancelar solo si no está `UTILIZADA` y el evento aún no comenzó.
   - Se puede reembolsar solo desde `CONFIRMADA` o `CANCELADA`.
3. **Reseña**: solo si la compra está `UTILIZADA`.
4. **Favoritos**: el usuario puede tener múltiples favoritos.

## Tests

Para ejecutar las pruebas de dominio y de servicio:

```bash
cd packages/backend
npm i
npm test
```

Se usa Jest + Supertest para probar la lógica de dominio y los servicios con repositorios en memoria.

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
src/backend/
+-- domain/                  # Entidades del dominio
+-- repository/               # Implementaciones en memoria
+-- service/                  # Lógica de negocio
+-- controller/               # Controladores HTTP
+-- route/                    # Definición de rutas
+-- middleware/               # Manejador de errores
+-- errors/                   # Errores tipificados
+-- docs/
   +-- swagger.js
   +-- api/                  # Documentación de rutas
+-- index.js                  # Punto de entrada
```
