import { useEffect, useState } from 'react'
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
import { apiPagos } from '../../servicios/pagos.js'
import { apiPedidos } from '../../servicios/pedidos.js'

const formularioInicial = {
  pedido_id: '',
  cliente_telefono: '',
  metodo_pago: 'efectivo',
  monto: '',
  monto_recibido: '',
  referencia: '',
}

/**
 * Muestra cantidades en pesos mexicanos.
 */
function mostrarDinero(valor) {
  return Number(valor ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

/**
 * Pantalla sencilla para registrar y consultar pagos.
 */
export default function Pagos() {
  const [pagos, setPagos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)

  /**
   * Consulta pedidos y pagos.
   */
  async function cargarDatos() {
    setCargando(true)
    setError('')

    try {
      const [respuestaPagos, respuestaPedidos] =
        await Promise.all([
          apiPagos.listar({ por_pagina: 100 }),
          apiPedidos.listar({ por_pagina: 100 }),
        ])

      setPagos(respuestaPagos.data ?? [])
      setPedidos(respuestaPedidos.data ?? [])
    } catch (errorPeticion) {
      setError(errorPeticion.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarDatos()
  }, [])

  /**
   * Suma los pagos aprobados de un pedido.
   */
  function calcularPagado(pedidoId) {
    return pagos
      .filter(
        (pago) =>
          String(pago.pedido?.id) === String(pedidoId) &&
          pago.estado === 'aprobado',
      )
      .reduce(
        (total, pago) => total + Number(pago.monto ?? 0),
        0,
      )
  }

  /**
   * Calcula cuánto falta por pagar.
   */
  function calcularSaldo(pedido) {
    return Math.max(
      0,
      Number(pedido?.total ?? 0) - calcularPagado(pedido?.id),
    )
  }

  const pedidoSeleccionado = pedidos.find(
    (pedido) =>
      String(pedido.id) === String(formulario.pedido_id),
  )

  const saldoPendiente = calcularSaldo(pedidoSeleccionado)

  const cambio = Math.max(
    0,
    Number(formulario.monto_recibido || 0) -
      Number(formulario.monto || 0),
  )

  /**
   * Abre el formulario.
   */
  function abrirFormulario() {
    setFormulario(formularioInicial)
    setErrores({})
    setError('')
    setMostrarModal(true)
  }

  /**
   * Actualiza los campos.
   */
  function cambiarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))

    setErrores((actuales) => ({
      ...actuales,
      [name]: undefined,
    }))
  }

  /**
   * Selecciona un pedido y coloca su saldo.
   */
  function cambiarPedido(evento) {
    const pedidoId = evento.target.value

    const pedido = pedidos.find(
      (item) => String(item.id) === String(pedidoId),
    )

    const saldo = calcularSaldo(pedido)

    setFormulario((actual) => ({
      ...actual,
      pedido_id: pedidoId,
      monto: pedidoId ? saldo.toFixed(2) : '',
      monto_recibido: '',
    }))
  }

  /**
   * Envía el pago al backend.
   */
  async function guardarPago(evento) {
    evento.preventDefault()
    setGuardando(true)
    setErrores({})
    setError('')

    try {
      const datos = {
        pedido_id: Number(formulario.pedido_id),
        cliente_telefono: formulario.cliente_telefono,
        metodo_pago: formulario.metodo_pago,
        monto: Number(formulario.monto),
        monto_recibido:
          formulario.metodo_pago === 'efectivo'
            ? Number(formulario.monto_recibido)
            : null,
        referencia:
          formulario.metodo_pago === 'tarjeta' ||
          formulario.metodo_pago === 'transferencia'
            ? formulario.referencia
            : null,
      }

      const respuesta = await apiPagos.crear(datos)

      setMensaje(respuesta.mensaje)
      setMostrarModal(false)
      setFormulario(formularioInicial)

      await cargarDatos()
    } catch (errorPeticion) {
      setError(errorPeticion.message)
      setErrores(errorPeticion.datos?.errors ?? {})
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Pagos</h1>
          <p className="text-muted mb-0">
            Registro de pagos de los pedidos.
          </p>
        </div>

        <Button variant="primary" onClick={abrirFormulario}>
          Registrar pago
        </Button>
      </div>

      {mensaje && (
        <Alert variant="success">{mensaje}</Alert>
      )}

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      <Card>
        <Card.Body>
          {cargando ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : pagos.length === 0 ? (
            <p className="text-muted mb-0">
              No existen pagos registrados.
            </p>
          ) : (
            <div className="table-responsive">
              <Table hover align="middle">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Método</th>
                    <th>Monto</th>
                    <th>Cambio</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.id}>
                      <td>
                        {pago.pedido?.folio ??
                          `Pedido #${pago.pedido?.id}`}
                      </td>

                      <td className="text-capitalize">
                        {pago.metodo_pago}
                      </td>

                      <td>{mostrarDinero(pago.monto)}</td>

                      <td>{mostrarDinero(pago.cambio)}</td>

                      <td>
                        {pago.pagado_en
                          ? new Date(
                              pago.pagado_en,
                            ).toLocaleString('es-MX')
                          : 'Sin fecha'}
                      </td>

                      <td>
                        <Badge bg="success">
                          {pago.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        centered
      >
        <Form onSubmit={guardarPago}>
          <Modal.Header closeButton>
            <Modal.Title>Registrar pago</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Group className="mb-3">
  <Form.Label>Número de WhatsApp</Form.Label>

  <Form.Control
    type="tel"
    name="cliente_telefono"
    inputMode="numeric"
    pattern="[0-9]{10}"
    maxLength={10}
    placeholder="Ejemplo: 9511234567"
    value={formulario.cliente_telefono}
    onChange={cambiarCampo}
    isInvalid={Boolean(errores.cliente_telefono)}
    required
  />

  <Form.Text className="text-muted">
    Escribe exactamente 10 dígitos, sin +52, espacios ni guiones.
  </Form.Text>

  <Form.Control.Feedback type="invalid">
    {errores.cliente_telefono?.[0]}
  </Form.Control.Feedback>
</Form.Group>
              <Form.Label>Pedido</Form.Label>

              <Form.Select
                value={formulario.pedido_id}
                onChange={cambiarPedido}
                isInvalid={Boolean(errores.pedido_id)}
                required
              >
                <option value="">Selecciona un pedido</option>

                {pedidos
                  .filter(
                    (pedido) =>
                      pedido.estado !== 'cancelado' &&
                      calcularSaldo(pedido) > 0,
                  )
                  .map((pedido) => (
                    <option
                      key={pedido.id}
                      value={pedido.id}
                    >
                      {pedido.folio} —{' '}
                      {mostrarDinero(
                        calcularSaldo(pedido),
                      )}{' '}
                      pendiente
                    </option>
                  ))}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                {errores.pedido_id?.[0]}
              </Form.Control.Feedback>
            </Form.Group>

            {pedidoSeleccionado && (
              <Alert variant="secondary">
                Total: {mostrarDinero(
                  pedidoSeleccionado.total,
                )}
                {' | '}
                Pendiente: {mostrarDinero(
                  saldoPendiente,
                )}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Método de pago</Form.Label>

              <Form.Select
                name="metodo_pago"
                value={formulario.metodo_pago}
                onChange={cambiarCampo}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">
                  Transferencia
                </option>
                <option value="otro">Otro</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>

              <Form.Control
                type="number"
                name="monto"
                min="0.01"
                step="0.01"
                max={saldoPendiente || undefined}
                value={formulario.monto}
                onChange={cambiarCampo}
                isInvalid={Boolean(errores.monto)}
                required
              />

              <Form.Control.Feedback type="invalid">
                {errores.monto?.[0]}
              </Form.Control.Feedback>
            </Form.Group>

            {formulario.metodo_pago === 'efectivo' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Monto recibido</Form.Label>

                  <Form.Control
                    type="number"
                    name="monto_recibido"
                    min="0"
                    step="0.01"
                    value={formulario.monto_recibido}
                    onChange={cambiarCampo}
                    isInvalid={Boolean(
                      errores.monto_recibido,
                    )}
                    required
                  />

                  <Form.Control.Feedback type="invalid">
                    {errores.monto_recibido?.[0]}
                  </Form.Control.Feedback>
                </Form.Group>

                <Alert variant="light">
                  Cambio: <strong>{mostrarDinero(cambio)}</strong>
                </Alert>
              </>
            )}

            {(formulario.metodo_pago === 'tarjeta' ||
              formulario.metodo_pago === 'transferencia') && (
              <Form.Group>
                <Form.Label>Referencia</Form.Label>

                <Form.Control
                  type="text"
                  name="referencia"
                  value={formulario.referencia}
                  onChange={cambiarCampo}
                  isInvalid={Boolean(errores.referencia)}
                  required
                />

                <Form.Control.Feedback type="invalid">
                  {errores.referencia?.[0]}
                </Form.Control.Feedback>
              </Form.Group>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setMostrarModal(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                guardando ||
                !formulario.pedido_id ||
                saldoPendiente <= 0
              }
            >
              {guardando ? 'Guardando...' : 'Guardar pago'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  )
}