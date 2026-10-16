import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

// Repositories (in-memory)
import { UsuarioRepository } from './repository/UsuarioRepository.js';
import { EventoRepository } from './repository/EventoRepository.js';
import { CategoriaRepository } from './repository/CategoriaRepository.js';
import { TipoEntradaRepository } from './repository/TipoEntradaRepository.js';
import { CompraRepository } from './repository/CompraRepository.js';
import { MensajeRepository } from './repository/MensajeRepository.js';
import { ReseñaRepository } from './repository/ReseñaRepository.js';
import { CambioEstadoCompraRepository } from './repository/CambioEstadoCompraRepository.js';

// Services
import { UsuarioService } from './service/UsuarioService.js';
import { EventoService } from './service/EventoService.js';
import { TipoEntradaService } from './service/TipoEntradaService.js';
import { CompraService } from './service/CompraService.js';
import { MensajeService } from './service/MensajeService.js';
import { ReseñaService } from './service/ReseñaService.js';

// Controllers
import { UsuarioController } from './controller/UsuarioController.js';
import { EventoController } from './controller/EventoController.js';
import { TipoEntradaController } from './controller/TipoEntradaController.js';
import { CompraController } from './controller/CompraController.js';
import { MensajeController } from './controller/MensajeController.js';
import { ReseñaController } from './controller/ReseñaController.js';

// Routes factories
import { createUsuarioRouter } from './route/UsuarioRoute.js';
import { createEventoRouter } from './route/EventoRoute.js';
import { createCompraRouter } from './route/CompraRoute.js';
import { createTipoEntradaRouter } from './route/TipoEntradaRoute.js';
import { createOrganizadorRouter } from './route/OrganizadorRoute.js';

// Instanciar repositories (in-memory)
const usuarioRepository = new UsuarioRepository();
const eventoRepository = new EventoRepository();
const categoriaRepository = new CategoriaRepository();
const tipoEntradaRepository = new TipoEntradaRepository();
const compraRepository = new CompraRepository();
const mensajeRepository = new MensajeRepository();
const resenaRepository = new ReseñaRepository();
const cambioEstadoCompraRepository = new CambioEstadoCompraRepository();

// Instanciar services (inyeccion de dependencias)
const usuarioService = new UsuarioService(usuarioRepository);
const eventoService = new EventoService(eventoRepository, categoriaRepository, tipoEntradaRepository, resenaRepository, compraRepository);
const tipoEntradaService = new TipoEntradaService(tipoEntradaRepository, eventoRepository);
const compraService = new CompraService(
  compraRepository,
  eventoRepository,
  tipoEntradaRepository,
  usuarioRepository,
  cambioEstadoCompraRepository
);
const mensajeService = new MensajeService(mensajeRepository, compraRepository, usuarioRepository);
const resenaService = new ReseñaService(resenaRepository, compraRepository, eventoRepository, usuarioRepository);

// Instanciar controllers (inyeccion de dependencias)
const usuarioController = new UsuarioController(usuarioService);
const eventoController = new EventoController(eventoService);
const tipoEntradaController = new TipoEntradaController(tipoEntradaService);
const compraController = new CompraController(compraService);
const mensajeController = new MensajeController(mensajeService);
const resenaController = new ReseñaController(resenaService);

// Crear app Express
const app = express();
app.use(express.json());

// API base
app.use('/api/usuarios', createUsuarioRouter(usuarioController, compraController));
app.use('/api/eventos', createEventoRouter(eventoController, tipoEntradaController, resenaController, compraController));
app.use('/api/compras', createCompraRouter(compraController, mensajeController));
app.use('/api/tipos-entrada', createTipoEntradaRouter(compraController));
app.use('/api/organizadores', createOrganizadorRouter(eventoController, resenaController));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'ai-ticket-it-backend' });
});

// Manejador central de errores (siempre al final)
app.use(errorHandler);

export default app;
