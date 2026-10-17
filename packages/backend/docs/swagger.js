import swaggerUi from 'swagger-ui-express';

const specs = {
    openapi: '3.0.0',
    info: {
        title: 'AI Ticket It Backend API',
        version: '1.0.0',
        description: 'API REST del Trabajo Práctico Individual de Desarrollo con IA (2C 2026) - AI Ticket It'
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Servidor local de desarrollo'
        }
    ],
    paths: {}
};

export function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
