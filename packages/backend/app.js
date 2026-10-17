import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

import { UsuarioRepository } from './repository/UsuarioRepository.js';
import { EventoRepository } from './repository/EventoRepository.js';
import { CategoriaRepository } from './repository/CategoriaRepository.js';
import { TipoEntradaRepository } from './repository/TipoEntradaRepository.js';
import { CompraRepository } from './repository/CompraRepository.js';
import { MensajeRepository } from './repository/MensajeRepository.js';
import { ReseñaRepository } from './repository/ReseñaRepository.js';
import { CambioEstadoCompraRepository } from './repository/CambioEstadoCompraRepository.js';

import { UsuarioService } from './service/UsuarioService.js';
import { EventoService } from './service/EventoService.js';
import { TipoEntradaService } from './service/TipoEntradaService.js';
import { CompraService } from './service/CompraService.js';
import { MensajeService } from './service/MensajeService.js';
import { ReseñaService } from './service/ReseñaService.js';
import { CategoriaService } from './service/CategoriaService.js';

import { UsuarioController } from './controller/UsuarioController.js';
import { EventoController } from './controller/EventoController.js';
import { TipoEntradaController } from './controller/TipoEntradaController.js';
import { CompraController } from './controller/CompraController.js';
import { MensajeController } from './controller/MensajeController.js';
import { ReseñaController } from './controller/ReseñaController.js';
import { CategoriaController } from './controller/CategoriaController.js';

import { createUsuarioRouter } from './route/UsuarioRoute.js';
import { createEventoRouter } from './route/EventoRoute.js';
import { createCompraRouter } from './route/CompraRoute.js';
import { createTipoEntradaRouter } from './route/TipoEntradaRoute.js';
import { createOrganizadorRouter } from './route/OrganizadorRoute.js';
import { createCategoriaRouter } from './route/CategoriaRoute.js';

// Repositories
const usuarioRepository = new UsuarioRepository();
const eventoRepository = new EventoRepository();
const categoriaRepository = new CategoriaRepository();
const tipoEntradaRepository = new TipoEntradaRepository();
const compraRepository = new CompraRepository();
const mensajeRepository = new MensajeRepository();
const resenaRepository = new ReseñaRepository();
const cambioEstadoCompraRepository = new CambioEstadoCompraRepository();

// Services
const usuarioService = new UsuarioService(usuarioRepository);
const eventoService = new EventoService(eventoRepository, categoriaRepository, usuarioRepository, resenaRepository);
const tipoEntradaService = new TipoEntradaService(tipoEntradaRepository, eventoRepository);
const compraService = new CompraService(
  compraRepository,
  eventoRepository,
  tipoEntradaRepository,
  usuarioRepository,
  cambioEstadoCompraRepository
);
const categoriaService = new CategoriaService(categoriaRepository);
const mensajeService = new MensajeService(mensajeRepository, compraRepository, usuarioRepository);
const resenaService = new ReseñaService(resenaRepository, compraRepository, eventoRepository, usuarioRepository);

// Controllers
const usuarioController = new UsuarioController(usuarioService);
const eventoController = new EventoController(eventoService);
const tipoEntradaController = new TipoEntradaController(tipoEntradaService);
const compraController = new CompraController(compraService);
const categoriaController = new CategoriaController(categoriaService);
const mensajeController = new MensajeController(mensajeService);
const resenaController = new ReseñaController(resenaService);

// Crear app Express
const app = express();
app.use(express.json());

// Routes
app.use('/usuarios', createUsuarioRouter(usuarioController, compraController));
app.use('/eventos', createEventoRouter(eventoController, tipoEntradaController, resenaController, compraController));
app.use('/compras', createCompraRouter(compraController, mensajeController));
app.use('/tipos-entrada', createTipoEntradaRouter(compraController));
app.use('/organizadores', createOrganizadorRouter(eventoController, resenaController));
app.use('/categorias', createCategoriaRouter(categoriaController));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'ai-ticket-it-backend' });
});

// Manejador central de errores (siempre al final)
app.use(errorHandler);

export default app;
