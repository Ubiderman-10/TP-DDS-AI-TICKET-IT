import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './errors/NotFoundError.js';
import { setupSwagger } from './docs/swagger.js';

// Repositorios (persistencia en memoria)
import { CategoriaRepository } from './repository/CategoriaRepository.js';
import { UsuarioRepository } from './repository/UsuarioRepository.js';
import { EventoRepository } from './repository/EventoRepository.js';
import { TipoEntradaRepository } from './repository/TipoEntradaRepository.js';
import { CompraRepository } from './repository/CompraRepository.js';
import { MensajeRepository } from './repository/MensajeRepository.js';
import { ReseñaRepository } from './repository/ReseñaRepository.js';
import { CambioEstadoCompraRepository } from './repository/CambioEstadoCompraRepository.js';

// Servicios
import { CategoriaService } from './service/CategoriaService.js';
import { UsuarioService } from './service/UsuarioService.js';
import { EventoService } from './service/EventoService.js';
import { TipoEntradaService } from './service/TipoEntradaService.js';
import { CompraService } from './service/CompraService.js';
import { MensajeService } from './service/MensajeService.js';
import { ReseñaService } from './service/ReseñaService.js';

// Controllers
import { CategoriaController } from './controller/CategoriaController.js';
import { UsuarioController } from './controller/UsuarioController.js';
import { EventoController } from './controller/EventoController.js';
import { TipoEntradaController } from './controller/TipoEntradaController.js';
import { CompraController } from './controller/CompraController.js';
import { MensajeController } from './controller/MensajeController.js';
import { ReseñaController } from './controller/ReseñaController.js';

// Routers
import { createCategoriaRouter } from './route/CategoriaRoute.js';
import { createUsuarioRouter } from './route/UsuarioRoute.js';
import { createEventoRouter } from './route/EventoRoute.js';
import { createTipoEntradaRouter } from './route/TipoEntradaRoute.js';
import { createCompraRouter } from './route/CompraRoute.js';
import { createOrganizadorRouter } from './route/OrganizadorRoute.js';

// --- Composición de dependencias ---
const categoriaRepository = new CategoriaRepository();
const usuarioRepository = new UsuarioRepository();
const eventoRepository = new EventoRepository();
const tipoEntradaRepository = new TipoEntradaRepository();
const compraRepository = new CompraRepository();
const mensajeRepository = new MensajeRepository();
const resenaRepository = new ReseñaRepository();
const cambioEstadoRepository = new CambioEstadoCompraRepository();

export const servicios = {
  categoriaService: new CategoriaService(categoriaRepository),
  usuarioService: new UsuarioService(usuarioRepository, eventoRepository),
  eventoService: new EventoService(eventoRepository, categoriaRepository, usuarioRepository, resenaRepository, tipoEntradaRepository),
  tipoEntradaService: new TipoEntradaService(tipoEntradaRepository, eventoRepository),
  compraService: new CompraService(compraRepository, eventoRepository, tipoEntradaRepository, usuarioRepository, cambioEstadoRepository),
  mensajeService: new MensajeService(mensajeRepository, compraRepository, usuarioRepository),
  resenaService: new ReseñaService(resenaRepository, compraRepository, eventoRepository, usuarioRepository)
};

const categoriaController = new CategoriaController(servicios.categoriaService);
const usuarioController = new UsuarioController(servicios.usuarioService);
const eventoController = new EventoController(servicios.eventoService);
const tipoEntradaController = new TipoEntradaController(servicios.tipoEntradaService);
const compraController = new CompraController(servicios.compraService);
const mensajeController = new MensajeController(servicios.mensajeService);
const resenaController = new ReseñaController(servicios.resenaService);

// --- App ---
const app = express();
app.use(express.json());

// CORS simple (solo hace falta si se prueba el front en web).
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/categorias', createCategoriaRouter(categoriaController));
app.use('/api/usuarios', createUsuarioRouter(usuarioController, compraController));
app.use('/api/eventos', createEventoRouter(eventoController, tipoEntradaController, resenaController, compraController));
app.use('/api/tipos-entrada', createTipoEntradaRouter(compraController));
app.use('/api/compras', createCompraRouter(compraController, mensajeController));
app.use('/api/organizadores', createOrganizadorRouter(eventoController, resenaController));

setupSwagger(app);

// Ruta inexistente -> 404 en formato JSON
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

export default app;