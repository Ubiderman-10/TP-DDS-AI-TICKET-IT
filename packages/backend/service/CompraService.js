import { Compra } from '../domain/Compra.js';
import { CambioEstadoCompra } from '../domain/CambioEstadoCompra.js';
import { EstadoCompra } from '../domain/EstadoCompra.js';
import { NotFoundError } from '../errors/NotFoundError.js';
import { ValidationError } from '../errors/ValidationError.js';
import { BusinessRuleError } from '../errors/BusinessRuleError.js';
import { AuthorizationError } from '../errors/AuthorizationError.js';

export class CompraService {
    constructor(compraRepository, eventoRepository, tipoEntradaRepository, usuarioRepository, cambioEstadoRepository) {
        this.compraRepository = compraRepository;
        this.eventoRepository = eventoRepository;
        this.tipoEntradaRepository = tipoEntradaRepository;
        this.usuarioRepository = usuarioRepository;
        this.cambioEstadoRepository = cambioEstadoRepository;
    }

    // Entradas vendidas activas (sin canceladas ni reembolsadas) de un tipo de entrada.
    entradasVendidas(tipoEntradaId) {
        return this.compraRepository
            .getAll()
            .filter(
                (c) =>
                    c.tipoEntrada.id === tipoEntradaId &&
                    c.estado !== EstadoCompra.CANCELADA &&
                    c.estado !== EstadoCompra.REEMBOLSADA
            )
            .reduce((suma, c) => suma + c.cantidad, 0);
    }

    // Disponibilidad real: cupo - vendidas.
    disponibilidad(tipoEntradaId) {
        const tipo = this.tipoEntradaRepository.getById(tipoEntradaId);
        if (!tipo) {
            throw new NotFoundError('Tipo de entrada no encontrado');
        }
        return tipo.cupo - this.entradasVendidas(tipoEntradaId);
    }

    // Registrar un cambio de estado en el historial.
    registrarCambio(compra, estado, quien) {
        const cambio = new CambioEstadoCompra({ compra, estado, quien });
        this.cambioEstadoRepository.save(cambio);
        return cambio;
    }

    // Cambiar estado de una compra + registrar en historial.
    cambiarEstado(compraId, nuevoEstado, quien) {
        const compra = this.compraRepository.getById(compraId);
        if (!compra) {
            throw new NotFoundError('Compra no encontrada');
        }
        compra.actualizarEstado(nuevoEstado);
        this.registrarCambio(compra, nuevoEstado, quien);
        return compra;
    }

    // Realizar una compra (valida cupo y calcula el total).
    comprar(compradorId, eventoId, tipoEntradaId, cantidad) {
        const comprador = this.usuarioRepository.getById(compradorId);
        if (!comprador) {
            throw new NotFoundError('Comprador no encontrado');
        }
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        const tipo = this.tipoEntradaRepository.getById(tipoEntradaId);
        if (!tipo) {
            throw new NotFoundError('Tipo de entrada no encontrado');
        }
        if (cantidad <= 0) {
            throw new ValidationError('La cantidad debe ser mayor a 0');
        }
        const disponibles = this.disponibilidad(tipoEntradaId);
        if (disponibles < cantidad) {
            throw new BusinessRuleError(`No hay cupo suficiente. Disponibles: ${disponibles}`);
        }

        const total = tipo.precio * cantidad;
        const compra = new Compra({
            comprador: comprador,
            evento: evento,
            tipoEntrada: tipo,
            cantidad,
            total,
            estado: EstadoCompra.PENDIENTE,
            mensajes: []
        });
        this.compraRepository.save(compra);
        this.registrarCambio(compra, EstadoCompra.PENDIENTE, comprador);
        return compra;
    }

    // Confirmar una compra (por ejemplo, tras el pago).
    confirmar(compraId, usuarioId) {
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        return this.cambiarEstado(compraId, EstadoCompra.CONFIRMADA, usuario);
    }

    // Marcar la entrada como utilizada en el evento.
    marcarUtilizada(compraId, usuarioId) {
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        return this.cambiarEstado(compraId, EstadoCompra.UTILIZADA, usuario);
    }

    // Cancelar compra (solo el comprador, si no esta utilizada y el evento no paso).
    cancelar(compraId, usuarioId) {
        const compra = this.compraRepository.getById(compraId);
        if (!compra) {
            throw new NotFoundError('Compra no encontrada');
        }
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        if (compra.comprador.id !== usuarioId) {
            throw new AuthorizationError('Solo el comprador puede cancelar la compra');
        }
        if (!compra.puedeSerCancelada()) {
            throw new BusinessRuleError('La compra no puede ser cancelada');
        }
        return this.cambiarEstado(compraId, EstadoCompra.CANCELADA, usuario);
    }

    // Reembolso (solo de compras canceladas).
    reembolsar(compraId, usuarioId) {
        const compra = this.compraRepository.getById(compraId);
        if (!compra) {
            throw new NotFoundError('Compra no encontrada');
        }
        if (compra.estado !== EstadoCompra.CANCELADA) {
            throw new BusinessRuleError('Solo se reembolsan compras canceladas');
        }
        const usuario = this.usuarioRepository.getById(usuarioId);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        return this.cambiarEstado(compraId, EstadoCompra.REEMBOLSADA, usuario);
    }

    // Dias faltantes hasta el evento.
    diasFaltantes(fechaEvento) {
        const msPorDia = 1000 * 60 * 60 * 24;
        return Math.ceil((fechaEvento.getTime() - Date.now()) / msPorDia);
    }

    // Compras del usuario con estado y dias faltantes (si esta confirmada).
    getComprasDelUsuario(usuarioId) {
        return this.compraRepository
            .getAll()
            .filter((c) => c.comprador.id === usuarioId)
            .map((c) => ({
                id: c.id,
                evento: { id: c.evento.id, nombre: c.evento.nombre, fecha: c.evento.fecha },
                tipoEntrada: { id: c.tipoEntrada.id, nombre: c.tipoEntrada.nombre },
                cantidad: c.cantidad,
                total: c.total,
                estado: c.estado,
                diasFaltantes: c.estado === EstadoCompra.CONFIRMADA ? this.diasFaltantes(c.evento.fecha) : null
            }));
    }

    // Compras de un evento + disponibilidad por tipo de entrada.
    getComprasDeEvento(eventoId) {
        const evento = this.eventoRepository.getById(eventoId);
        if (!evento) {
            throw new NotFoundError('Evento no encontrado');
        }
        const compras = this.compraRepository
            .getAll()
            .filter((c) => c.evento.id === eventoId)
            .map((c) => ({
                id: c.id,
                comprador: { id: c.comprador.id, nombre: c.comprador.nombre, apellido: c.comprador.apellido },
                tipoEntrada: { id: c.tipoEntrada.id, nombre: c.tipoEntrada.nombre },
                cantidad: c.cantidad,
                total: c.total,
                estado: c.estado
            }));
        const disponibilidad = evento.tiposEntrada.map((tipo) => ({
            tipoEntradaId: tipo.id,
            nombre: tipo.nombre,
            disponibles: this.disponibilidad(tipo.id)
        }));
        return { compras, disponibilidad };
    }
}
