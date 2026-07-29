import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Modal,
  Spinner,
  Table,
} from 'react-bootstrap'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiVentas } from '../../servicios/ventas.js'

/**
 * Convierte un monto a pesos mexicanos.
 */
function mostrarMoneda(monto) {
  return Number(monto ?? 0).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
    },
  )
}

/**
 * Convierte una fecha en texto legible.
 */
function mostrarFecha(fecha) {
  return fecha
    ? new Date(fecha).toLocaleString('es-MX')
    : 'No disponible'
}

/**
 * Convierte el estado del ticket.
 */
function estadoLegible(estado) {
  const estados = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    en_preparacion: 'En preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }

  return estados[estado] ?? estado
}

/**
 * Pantalla para consultar y cancelar ventas.
 */
export default function HistorialVentas() {
  const { usuario } = useAutenticacion()

  const [ventas, establecerVentas] = useState([])
  const [buscar, establecerBuscar] = useState('')
  const [estado, establecerEstado] = useState('')
  const [cargando, establecerCargando] =
    useState(true)
  const [ventaSeleccionada, establecerVenta] =
    useState(null)
  const [mostrandoDetalle, establecerDetalle] =
    useState(false)
  const [
    mostrandoCancelacion,
    establecerCancelacion,
  ] = useState(false)
  const [motivo, establecerMotivo] = useState('')
  const [guardando, establecerGuardando] =
    useState(false)
  const [mensaje, establecerMensaje] = useState('')
  const [error, establecerError] = useState('')

  const puedeCancelar = [
    'administrador',
    'gerente',
  ].includes(usuario?.rol)

  /**
   * Consulta las ventas del backend.
   */
  const consultarVentas = useCallback(
    async (filtros = {}) => {
      establecerCargando(true)
      establecerError('')

      try {
        const respuesta = await apiVentas.listar({
          ...filtros,
          por_pagina: 100,
        })

        establecerVentas(respuesta?.data ?? [])
      } catch (errorApi) {
        establecerError(errorApi.message)
      } finally {
        establecerCargando(false)
      }
    },
    [],
  )

  useEffect(() => {
    consultarVentas()
  }, [consultarVentas])

  /**
   * Aplica los filtros básicos.
   */
  function filtrarVentas(evento) {
    evento.preventDefault()

    consultarVentas({
      buscar,
      estado,
    })
  }

  /**
   * Limpia los filtros.
   */
  function limpiarFiltros() {
    establecerBuscar('')
    establecerEstado('')
    consultarVentas()
  }

  /**
   * Consulta los detalles de una venta.
   */
  async function verDetalle(id) {
    establecerError('')

    try {
      const respuesta = await apiVentas.obtener(id)

      establecerVenta(respuesta?.venta ?? null)
      establecerDetalle(true)
    } catch (errorApi) {
      establecerError(errorApi.message)
    }
  }

  /**
   * Abre el formulario de cancelación.
   */
  function abrirCancelacion(venta) {
    establecerVenta(venta)
    establecerMotivo('')
    establecerCancelacion(true)
  }

  /**
   * Envía la cancelación al backend.
   */
  async function cancelarVenta(evento) {
    evento.preventDefault()

    if (motivo.trim().length < 10) {
      establecerError(
        'El motivo debe contener al menos 10 caracteres.',
      )

      return
    }

    establecerGuardando(true)
    establecerError('')

    try {
      const respuesta = await apiVentas.cancelar(
        ventaSeleccionada.id,
        motivo.trim(),
      )

      establecerMensaje(respuesta.mensaje)
      establecerCancelacion(false)
      establecerDetalle(false)

      await consultarVentas({
        buscar,
        estado,
      })
    } catch (errorApi) {
      establecerError(
        errorApi.datos?.errors
          ?.motivo_cancelacion?.[0] ??
          errorApi.datos?.errors?.pedido?.[0] ??
          errorApi.message,
      )
    } finally {
      establecerGuardando(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 mb-1">
          Historial de ventas
        </h1>

        <p className="text-muted mb-0">
          Consulta y cancela tickets registrados.
        </p>
      </div>

      {mensaje && (
        <Alert
          variant="success"
          dismissible
          onClose={() => establecerMensaje('')}
        >
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => establecerError('')}
        >
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Form
            onSubmit={filtrarVentas}
            className="d-flex flex-wrap gap-2"
          >
            <Form.Control
              value={buscar}
              onChange={(evento) =>
                establecerBuscar(evento.target.value)
              }
              placeholder="Folio o cliente"
              style={{ maxWidth: '300px' }}
            />

            <Form.Select
              value={estado}
              onChange={(evento) =>
                establecerEstado(evento.target.value)
              }
              style={{ maxWidth: '220px' }}
            >
              <option value="">
                Todos los estados
              </option>
              <option value="entregado">
                Entregado
              </option>
              <option value="cancelado">
                Cancelado
              </option>
              <option value="confirmado">
                Confirmado
              </option>
            </Form.Select>

            <Button type="submit">
              Buscar
            </Button>

            <Button
              type="button"
              variant="outline-secondary"
              onClick={limpiarFiltros}
            >
              Limpiar
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" />

              <p className="mt-3">
                Consultando ventas...
              </p>
            </div>
          ) : ventas.length === 0 ? (
            <Alert
              variant="info"
              className="m-3"
            >
              No existen ventas para mostrar.
            </Alert>
          ) : (
            <Table
              responsive
              hover
              className="mb-0 align-middle"
            >
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td>{venta.folio}</td>

                    <td>
                      {mostrarFecha(
                        venta.pedido_en,
                      )}
                    </td>

                    <td>
                      {venta.cliente_nombre ??
                        'Público general'}
                    </td>

                    <td>
                      {mostrarMoneda(venta.total)}
                    </td>

                    <td>
                      <Badge
                        bg={
                          venta.estado ===
                          'cancelado'
                            ? 'danger'
                            : 'success'
                        }
                      >
                        {estadoLegible(
                          venta.estado,
                        )}
                      </Badge>
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() =>
                          verDetalle(venta.id)
                        }
                      >
                        Ver
                      </Button>

                      {puedeCancelar &&
                        venta.estado !==
                          'cancelado' && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              abrirCancelacion(
                                venta,
                              )
                            }
                          >
                            Cancelar
                          </Button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Detalles del ticket. */}
      <Modal
        show={mostrandoDetalle}
        onHide={() => establecerDetalle(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Detalle de venta
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {ventaSeleccionada && (
            <>
              <p>
                <strong>Folio:</strong>{' '}
                {ventaSeleccionada.folio}
              </p>

              <p>
                <strong>Cliente:</strong>{' '}
                {ventaSeleccionada
                  .cliente_nombre ??
                  'Público general'}
              </p>

              <p>
                <strong>Empleado:</strong>{' '}
                {ventaSeleccionada.usuario
                  ?.nombre ??
                  'No disponible'}
              </p>

              <p>
                <strong>Total:</strong>{' '}
                {mostrarMoneda(
                  ventaSeleccionada.total,
                )}
              </p>

              <hr />

              <strong>Productos:</strong>

              <ul className="mt-2">
                {(
                  ventaSeleccionada.productos ??
                  []
                ).map((detalle) => (
                  <li key={detalle.id}>
                    {detalle.producto?.nombre}{' '}
                    — {detalle.cantidad}
                  </li>
                ))}
              </ul>

              {ventaSeleccionada.estado ===
                'cancelado' && (
                <Alert variant="danger">
                  <strong>
                    Motivo de cancelación:
                  </strong>{' '}
                  {
                    ventaSeleccionada
                      .motivo_cancelacion
                  }
                </Alert>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              establecerDetalle(false)
            }
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Formulario para cancelar. */}
      <Modal
        show={mostrandoCancelacion}
        onHide={() =>
          establecerCancelacion(false)
        }
        centered
      >
        <Form onSubmit={cancelarVenta}>
          <Modal.Header closeButton>
            <Modal.Title>
              Cancelar ticket
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Alert variant="warning">
              El ticket seguirá guardado en el
              historial.
            </Alert>

            <Form.Label>
              Motivo de cancelación
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              value={motivo}
              onChange={(evento) =>
                establecerMotivo(
                  evento.target.value,
                )
              }
              maxLength={500}
              required
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                establecerCancelacion(false)
              }
            >
              Regresar
            </Button>

            <Button
              type="submit"
              variant="danger"
              disabled={guardando}
            >
              {guardando
                ? 'Cancelando...'
                : 'Confirmar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}