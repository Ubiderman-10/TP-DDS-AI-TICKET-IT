export const fixtures = {
    categoria: () => ({ nombre: 'Musica', descripcion: 'Eventos musicales' }),

    tipoEntrada: (overrides = {}) => ({
        nombre: 'General',
        descripcion: 'Entrada general',
        precio: 5000,
        cupo: 100,
        ...overrides
    }),

    usuario: (overrides = {}) => ({
        nombre: 'Juan',
        apellido: 'Perez',
        ...overrides
    }),

    organizador: () => ({ nombre: 'Juan', apellido: 'Perez' }),
    comprador: () => ({ nombre: 'Maria', apellido: 'Gomez' }),

    evento: (overrides = {}) => ({
        nombre: 'Confeti Fest',
        descripcion: 'Festival de confeti',
        fecha: new Date(Date.now() + 86400000).toISOString(),
        multimedia: ['https://example.com/confeti.jpg'],
        organizador: null,
        categoria: null,
        tiposEntrada: [],
        ...overrides
    }),

    compra: (overrides = {}) => ({
        comprador: null,
        evento: null,
        tipoEntrada: null,
        cantidad: 2,
        total: 10000,
        estado: 'PENDIENTE',
        cambiosEstado: [],
        ...overrides
    }),

    mensaje: (overrides = {}) => ({
        usuario: null,
        compra: null,
        texto: 'Hola',
        ...overrides
    }),

    reseña: (overrides = {}) => ({
        comprador: null,
        evento: null,
        puntuacion: 4,
        detalle: 'Muy bien',
        ...overrides
    }),

    cambioEstado: (overrides = {}) => ({
        compra: null,
        estado: 'CONFIRMADA',
        quien: 'Sistema',
        timestamp: new Date().toISOString(),
        ...overrides
    })
};
