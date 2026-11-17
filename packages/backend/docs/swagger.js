import swaggerUi from 'swagger-ui-express';

const errorSchema = {
    type: 'object',
    required: ['error', 'message', 'code'],
    properties: {
        error: { type: 'boolean', enum: [true] },
        message: { type: 'string' },
        code: {
            type: 'string',
            enum: ['VALIDATION_ERROR', 'NOT_FOUND', 'BUSINESS_RULE_ERROR', 'AUTHORIZATION_ERROR', 'INTERNAL_ERROR']
        }
    }
};

const pathParameter = (name, description) => ({
    name,
    in: 'path',
    required: true,
    description,
    schema: { type: 'integer', minimum: 1 }
});

const queryParameter = (name, description, schema) => ({
    name,
    in: 'query',
    required: false,
    description,
    schema
});

const requestBody = (schema, description = 'Datos de la solicitud.') => ({
    required: true,
    description,
    content: {
        'application/json': {
            schema: { $ref: `#/components/schemas/${schema}` }
        }
    }
});

const errorResponses = {
    400: { description: 'Datos inválidos.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
    403: { description: 'El usuario no tiene permisos para realizar la operación.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
    404: { description: 'No se encontró el recurso solicitado.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
    409: { description: 'La operación no cumple una regla de negocio.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
    500: { description: 'Error inesperado del servidor.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
};

const operation = ({ summary, tag, status = 200, parameters = [], body, errors = [500], description }) => {
    const responses = {
        [status]: {
            description: description || (status === 201 ? 'Recurso creado.' : 'Operación exitosa.'),
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
            }
        }
    };

    errors.forEach((code) => {
        responses[code] = errorResponses[code];
    });

    return {
        tags: [tag],
        summary,
        ...(parameters.length ? { parameters } : {}),
        ...(body ? { requestBody: body } : {}),
        responses
    };
};

const id = (name, description) => pathParameter(name, description);
const usuarioId = id('usuarioId', 'Identificador del usuario.');
const eventoId = id('eventoId', 'Identificador del evento.');
const compraId = id('compraId', 'Identificador de la compra.');
const tipoEntradaId = id('tipoEntradaId', 'Identificador del tipo de entrada.');
const organizadorId = id('organizadorId', 'Identificador del organizador.');

const specs = {
    openapi: '3.0.3',
    info: {
        title: 'AI Ticket It Backend API',
        version: '1.0.0',
        description: 'API REST del Trabajo Práctico Individual de Desarrollo con IA (2C 2026) - AI Ticket It. Los ejemplos y reglas detalladas están en API.md.'
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Servidor local de desarrollo'
        }
    ],
    tags: [
        { name: 'Sistema' },
        { name: 'Categorías' },
        { name: 'Usuarios' },
        { name: 'Eventos' },
        { name: 'Tipos de entrada' },
        { name: 'Compras' },
        { name: 'Mensajes' },
        { name: 'Reseñas' },
        { name: 'Organizadores' }
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Sistema'],
                summary: 'Verificar disponibilidad de la API',
                responses: {
                    200: {
                        description: 'La API está disponible.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HealthResponse' }
                            }
                        }
                    }
                }
            }
        },
        '/categorias': {
            get: operation({
                summary: 'Listar categorías',
                tag: 'Categorías'
            }),
            post: operation({
                summary: 'Crear categoría',
                tag: 'Categorías',
                status: 201,
                body: requestBody('CategoriaInput'),
                errors: [400, 500]
            })
        },
        '/usuarios': {
            get: operation({
                summary: 'Listar usuarios',
                tag: 'Usuarios'
            }),
            post: operation({
                summary: 'Crear usuario',
                tag: 'Usuarios',
                status: 201,
                body: requestBody('UsuarioInput'),
                errors: [400, 500]
            })
        },
        '/usuarios/{usuarioId}': {
            get: operation({
                summary: 'Obtener usuario',
                tag: 'Usuarios',
                parameters: [usuarioId],
                errors: [404, 500]
            })
        },
        '/usuarios/{usuarioId}/favoritos': {
            post: operation({
                summary: 'Agregar evento a favoritos',
                tag: 'Usuarios',
                parameters: [usuarioId],
                body: requestBody('FavoritoInput'),
                errors: [403, 404, 500]
            })
        },
        '/usuarios/{usuarioId}/favoritos/{eventoId}': {
            delete: operation({
                summary: 'Quitar evento de favoritos',
                tag: 'Usuarios',
                parameters: [usuarioId, eventoId],
                errors: [404, 500]
            })
        },
        '/usuarios/{usuarioId}/compras': {
            get: operation({
                summary: 'Listar compras de un usuario',
                tag: 'Usuarios',
                parameters: [usuarioId]
            })
        },
        '/eventos': {
            get: operation({
                summary: 'Buscar y ordenar eventos',
                tag: 'Eventos',
                parameters: [
                    queryParameter('texto', 'Filtra por nombre o descripción.', { type: 'string' }),
                    queryParameter('categoriaId', 'Filtra por categoría.', { type: 'integer', minimum: 1 }),
                    queryParameter('orden', 'Criterio de ordenamiento.', {
                        type: 'string',
                        enum: ['precio', 'fecha', 'puntajeOrganizador']
                    }),
                    queryParameter('direccion', 'Sentido del ordenamiento.', { type: 'string', enum: ['asc', 'desc'] })
                ]
            }),
            post: operation({
                summary: 'Crear evento con tipos de entrada',
                tag: 'Eventos',
                status: 201,
                body: requestBody('EventoInput'),
                errors: [400, 403, 404, 500]
            })
        },
        '/eventos/{eventoId}': {
            get: operation({
                summary: 'Obtener detalle de evento',
                tag: 'Eventos',
                parameters: [eventoId],
                errors: [404, 500]
            })
        },
        '/eventos/{eventoId}/tipos-entrada': {
            get: operation({
                summary: 'Listar tipos de entrada de un evento',
                tag: 'Tipos de entrada',
                parameters: [eventoId],
                errors: [404, 500]
            }),
            post: operation({
                summary: 'Crear tipo de entrada para un evento',
                tag: 'Tipos de entrada',
                parameters: [eventoId],
                status: 201,
                body: requestBody('TipoEntradaInput'),
                errors: [400, 404, 500]
            })
        },
        '/eventos/{eventoId}/compras': {
            get: operation({
                summary: 'Listar compras y disponibilidad de un evento',
                tag: 'Compras',
                parameters: [eventoId],
                errors: [404, 500]
            })
        },
        '/tipos-entrada/{tipoEntradaId}/disponibilidad': {
            get: operation({
                summary: 'Consultar disponibilidad de un tipo de entrada',
                tag: 'Tipos de entrada',
                parameters: [tipoEntradaId],
                errors: [404, 500]
            })
        },
        '/compras': {
            post: operation({
                summary: 'Crear compra',
                tag: 'Compras',
                status: 201,
                body: requestBody('CompraInput'),
                errors: [400, 403, 404, 409, 500]
            })
        },
        '/compras/{compraId}/confirmar': {
            put: operation({
                summary: 'Confirmar compra',
                tag: 'Compras',
                parameters: [compraId],
                body: requestBody('UsuarioIdInput'),
                errors: [403, 404, 409, 500]
            })
        },
        '/compras/{compraId}/utilizar': {
            put: operation({
                summary: 'Marcar compra como utilizada',
                tag: 'Compras',
                parameters: [compraId],
                body: requestBody('UsuarioIdInput'),
                errors: [403, 404, 409, 500]
            })
        },
        '/compras/{compraId}/cancelar': {
            put: operation({
                summary: 'Cancelar compra',
                tag: 'Compras',
                parameters: [compraId],
                body: requestBody('UsuarioIdInput'),
                errors: [403, 404, 409, 500]
            })
        },
        '/compras/{compraId}/cancelar-y-reembolsar': {
            put: operation({
                summary: 'Cancelar y reembolsar compra confirmada',
                tag: 'Compras',
                parameters: [compraId],
                body: requestBody('UsuarioIdInput'),
                errors: [403, 404, 409, 500]
            })
        },
        '/compras/{compraId}/reembolsar': {
            put: operation({
                summary: 'Reembolsar compra cancelada',
                tag: 'Compras',
                parameters: [compraId],
                body: requestBody('UsuarioIdInput'),
                errors: [403, 404, 409, 500]
            })
        },
        '/compras/{compraId}/mensajes': {
            get: operation({
                summary: 'Listar mensajes de una compra',
                tag: 'Mensajes',
                parameters: [compraId],
                errors: [404, 500]
            }),
            post: operation({
                summary: 'Enviar mensaje en una compra',
                tag: 'Mensajes',
                parameters: [compraId],
                status: 201,
                body: requestBody('MensajeInput'),
                errors: [400, 403, 404, 500]
            })
        },
        '/compras/{compraId}/mensajes/responder': {
            post: operation({
                summary: 'Responder mensaje de una compra',
                tag: 'Mensajes',
                parameters: [compraId],
                status: 201,
                body: requestBody('RespuestaMensajeInput'),
                errors: [400, 403, 404, 500]
            })
        },
        '/eventos/{eventoId}/resenas': {
            get: operation({
                summary: 'Listar reseñas de un evento',
                tag: 'Reseñas',
                parameters: [eventoId]
            }),
            post: operation({
                summary: 'Crear reseña para un evento',
                tag: 'Reseñas',
                parameters: [eventoId],
                status: 201,
                body: requestBody('ResenaInput'),
                errors: [400, 404, 409, 500]
            })
        },
        '/organizadores/{organizadorId}/eventos': {
            get: operation({
                summary: 'Listar eventos de un organizador',
                tag: 'Organizadores',
                parameters: [organizadorId]
            })
        },
        '/organizadores/{organizadorId}/puntaje': {
            get: operation({
                summary: 'Consultar puntaje de un organizador',
                tag: 'Organizadores',
                parameters: [organizadorId]
            })
        }
    },
    components: {
        schemas: {
            HealthResponse: {
                type: 'object',
                required: ['ok'],
                properties: {
                    ok: { type: 'boolean', enum: [true] }
                }
            },
            SuccessResponse: {
                type: 'object',
                required: ['data'],
                properties: {
                    data: {
                        description: 'Contenido de la respuesta exitosa.'
                    }
                }
            },
            ErrorResponse: errorSchema,
            CategoriaInput: {
                type: 'object',
                required: ['nombre', 'descripcion'],
                properties: {
                    nombre: { type: 'string', minLength: 1 },
                    descripcion: { type: 'string', minLength: 1 }
                }
            },
            UsuarioInput: {
                type: 'object',
                required: ['nombre', 'apellido'],
                properties: {
                    nombre: { type: 'string', minLength: 1 },
                    apellido: { type: 'string', minLength: 1 },
                    rol: { type: 'string', enum: ['ORGANIZADOR', 'COMPRADOR', 'AMBOS'], default: 'AMBOS' }
                }
            },
            FavoritoInput: {
                type: 'object',
                required: ['eventoId'],
                properties: {
                    eventoId: { type: 'integer', minimum: 1 }
                }
            },
            EventoInput: {
                type: 'object',
                required: ['nombre', 'descripcion', 'fecha', 'categoriaId', 'organizadorId'],
                properties: {
                    nombre: { type: 'string', minLength: 1 },
                    descripcion: { type: 'string', minLength: 1 },
                    fecha: { type: 'string', format: 'date-time', description: 'Debe ser una fecha futura.' },
                    categoriaId: { type: 'integer', minimum: 1 },
                    organizadorId: { type: 'integer', minimum: 1 },
                    multimedia: { type: 'array', items: { type: 'string' } },
                    tiposEntrada: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/TipoEntradaInput' }
                    }
                }
            },
            TipoEntradaInput: {
                type: 'object',
                required: ['nombre', 'descripcion', 'precio', 'cupo'],
                properties: {
                    nombre: { type: 'string', minLength: 1 },
                    descripcion: { type: 'string', minLength: 1 },
                    precio: { type: 'number', minimum: 0, exclusiveMinimum: true },
                    cupo: { type: 'integer', minimum: 1 }
                }
            },
            CompraInput: {
                type: 'object',
                required: ['compradorId', 'eventoId', 'tipoEntradaId', 'cantidad'],
                properties: {
                    compradorId: { type: 'integer', minimum: 1 },
                    eventoId: { type: 'integer', minimum: 1 },
                    tipoEntradaId: { type: 'integer', minimum: 1 },
                    cantidad: { type: 'integer', minimum: 1 }
                }
            },
            UsuarioIdInput: {
                type: 'object',
                required: ['usuarioId'],
                properties: {
                    usuarioId: { type: 'integer', minimum: 1 }
                }
            },
            MensajeInput: {
                type: 'object',
                required: ['emisorId', 'texto'],
                properties: {
                    emisorId: { type: 'integer', minimum: 1 },
                    texto: { type: 'string', minLength: 1 }
                }
            },
            RespuestaMensajeInput: {
                type: 'object',
                required: ['emisorId', 'texto', 'mensajePadreId'],
                properties: {
                    emisorId: { type: 'integer', minimum: 1 },
                    texto: { type: 'string', minLength: 1 },
                    mensajePadreId: { type: 'integer', minimum: 1 }
                }
            },
            ResenaInput: {
                type: 'object',
                required: ['compradorId', 'detalle', 'puntuacion'],
                properties: {
                    compradorId: { type: 'integer', minimum: 1 },
                    detalle: { type: 'string', minLength: 1 },
                    puntuacion: { type: 'integer', minimum: 1, maximum: 5 }
                }
            }
        }
    }
};

export function setupSwagger(app) {
    app.get('/api-docs/openapi.json', (req, res) => {
        res.json(specs);
    });
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
