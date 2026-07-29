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
  Col,
  Form,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiCajas } from '../../servicios/cajas.js'

/**
 * Pantalla sencilla para abrir,
 * consultar y cerrar la caja.
 */
export default function Caja() {
  const { usuario } = useAutenticacion()

  const [
    cajaActiva,
    establecerCajaActiva,
  ] = useState(null)

  const [
    resumen,
    establecerResumen,
  ] = useState(null)

  const [
    montoInicial,
    establecerMontoInicial,
  ] = useState('')

  const [
    montoFinalReal,
    establecerMontoFinalReal,
  ] = useState('')

  const [
    observaciones,
    establecerObservaciones,
  ] = useState('')

  const [
    mostrandoCierre,
    establecerMostrandoCierre,
  ] = useState(false)

  const [
    cargando,
    establecerCargando,
  ] = useState(true)

  const [
    guardando,
    establecerGuardando,
  ] = useState(false)

  const [
    mensaje,
    establecerMensaje,
  ] = useState('')

  const [
    errorGeneral,
    establecerErrorGeneral,
  ] = useState('')

  const [
    errorMonto,
    establecerErrorMonto,
  ] = useState('')

  const puedeAdministrar = [
    'administrador',
    'gerente',
  ].includes(usuario?.rol)

  /**
   * Consulta la caja y su resumen.
   */
  const consultarCaja = useCallback(
    async () => {
      establecerCargando(true)
      establecerErrorGeneral('')

      try {
        const respuesta =
          await apiCajas.activa()

        establecerCajaActiva(
          respuesta?.caja ?? null,
        )

        establecerResumen(
          respuesta?.resumen ?? null,
        )
      } catch (error) {
        establecerErrorGeneral(
          error.message,
        )
      } finally {
        establecerCargando(false)
      }
    },
    [],
  )

  useEffect(() => {
    consultarCaja()
  }, [consultarCaja])

  /**
   * Abre una nueva caja.
   */
  async function abrirCaja(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerMensaje('')
    establecerErrorGeneral('')
    establecerErrorMonto('')

    try {
      const respuesta =
        await apiCajas.abrir({
          monto_inicial: Number(
            montoInicial,
          ),
        })

      establecerCajaActiva(
        respuesta?.caja ?? null,
      )

      establecerResumen(
        respuesta?.resumen ?? null,
      )

      establecerMontoInicial('')

      establecerMensaje(
        respuesta?.mensaje ??
          'La caja fue abierta correctamente.',
      )
    } catch (error) {
      establecerErrorMonto(
        error.datos?.errors
          ?.monto_inicial?.[0] ?? '',
      )

      establecerErrorGeneral(
        error.message,
      )
    } finally {
      establecerGuardando(false)
    }
  }

  /**
   * Abre el modal de corte.
   */
  function abrirModalCierre() {
    establecerMontoFinalReal(
      String(
        resumen?.efectivo_esperado ?? '',
      ),
    )

    establecerObservaciones('')
    establecerErrorMonto('')
    establecerErrorGeneral('')
    establecerMostrandoCierre(true)
  }

  /**
   * Realiza el corte y cierra la caja.
   */
  async function cerrarCaja(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerMensaje('')
    establecerErrorGeneral('')
    establecerErrorMonto('')

    try {
      const respuesta =
        await apiCajas.cerrar({
          monto_final_real: Number(
            montoFinalReal,
          ),
          observaciones:
            observaciones || null,
        })

      establecerMostrandoCierre(false)

      establecerMensaje(
        respuesta?.mensaje ??
          'La caja fue cerrada correctamente.',
      )

      await consultarCaja()
    } catch (error) {
      establecerErrorMonto(
        error.datos?.errors
          ?.monto_final_real?.[0] ?? '',
      )

      establecerErrorGeneral(
        error.message,
      )
    } finally {
      establecerGuardando(false)
    }
  }

  /**
   * Convierte un monto a moneda.
   */
  function mostrarMoneda(monto) {
    return Number(
      monto ?? 0,
    ).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    })
  }

  /**
   * Convierte la fecha en texto legible.
   */
  function mostrarFecha(fecha) {
    if (!fecha) {
      return 'No disponible'
    }

    return new Date(
      fecha,
    ).toLocaleString('es-MX')
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 mb-1">
          Caja
        </h1>

        <p className="text-muted mb-0">
          Apertura y corte de caja.
        </p>
      </div>

      {mensaje && (
        <Alert
          variant="success"
          dismissible
          onClose={() =>
            establecerMensaje('')
          }
        >
          {mensaje}
        </Alert>
      )}

      {errorGeneral && (
        <Alert
          variant="danger"
          dismissible
          onClose={() =>
            establecerErrorGeneral('')
          }
        >
          {errorGeneral}
        </Alert>
      )}

      {cargando ? (
        <Card>
          <Card.Body className="text-center py-5">
            <Spinner animation="border" />

            <p className="mt-3 mb-0">
              Consultando caja...
            </p>
          </Card.Body>
        </Card>
      ) : cajaActiva ? (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <strong>Caja activa</strong>

            <Badge bg="success">
              Abierta
            </Badge>
          </Card.Header>

          <Card.Body>
            <Row className="mb-4">
              <Col md={6}>
                <p className="mb-2">
                  <strong>
                    Número de caja:
                  </strong>{' '}
                  #{cajaActiva.id}
                </p>

                <p className="mb-2">
                  <strong>
                    Responsable:
                  </strong>{' '}
                  {cajaActiva
                    .usuario_apertura
                    ?.nombre ??
                    'No disponible'}
                </p>

                <p className="mb-0">
                  <strong>
                    Fecha:
                  </strong>{' '}
                  {mostrarFecha(
                    cajaActiva.abierta_en,
                  )}
                </p>
              </Col>

              <Col md={6}>
                <p className="mb-2">
                  <strong>
                    Monto inicial:
                  </strong>{' '}
                  {mostrarMoneda(
                    cajaActiva.monto_inicial,
                  )}
                </p>

                <p className="mb-0">
                  <strong>
                    Estado:
                  </strong>{' '}
                  Abierta
                </p>
              </Col>
            </Row>

            <hr />

            <h2 className="h5 mb-3">
              Resumen del turno
            </h2>

            <Row>
              <Col md={6}>
                <p>
                  Ventas en efectivo:{' '}
                  <strong>
                    {mostrarMoneda(
                      resumen?.ventas_efectivo,
                    )}
                  </strong>
                </p>

                <p>
                  Ventas con tarjeta:{' '}
                  <strong>
                    {mostrarMoneda(
                      resumen?.ventas_tarjeta,
                    )}
                  </strong>
                </p>

                <p>
                  Transferencias:{' '}
                  <strong>
                    {mostrarMoneda(
                      resumen
                        ?.ventas_transferencia,
                    )}
                  </strong>
                </p>
              </Col>

              <Col md={6}>
                <p>
                  Total vendido:{' '}
                  <strong>
                    {mostrarMoneda(
                      resumen?.total_vendido,
                    )}
                  </strong>
                </p>

                <p>
                  Efectivo esperado:{' '}
                  <strong>
                    {mostrarMoneda(
                      resumen
                        ?.efectivo_esperado,
                    )}
                  </strong>
                </p>
              </Col>
            </Row>

            {puedeAdministrar && (
              <Button
                type="button"
                variant="danger"
                onClick={abrirModalCierre}
              >
                Cerrar caja
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : puedeAdministrar ? (
        <Card>
          <Card.Header>
            <strong>Abrir caja</strong>
          </Card.Header>

          <Card.Body>
            <Alert variant="warning">
              No existe una caja abierta.
            </Alert>

            <Form
              onSubmit={abrirCaja}
              noValidate
            >
              <Form.Group className="mb-3">
                <Form.Label>
                  Monto inicial
                </Form.Label>

                <Form.Control
                  type="number"
                  value={montoInicial}
                  onChange={(evento) =>
                    establecerMontoInicial(
                      evento.target.value,
                    )
                  }
                  min="0"
                  step="0.01"
                  isInvalid={Boolean(
                    errorMonto,
                  )}
                  required
                />

                <Form.Control.Feedback type="invalid">
                  {errorMonto}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                type="submit"
                disabled={
                  guardando ||
                  montoInicial === ''
                }
              >
                {guardando
                  ? 'Abriendo...'
                  : 'Abrir caja'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">
          No existe una caja abierta.
        </Alert>
      )}

      <Modal
        show={mostrandoCierre}
        onHide={() =>
          establecerMostrandoCierre(false)
        }
        centered
      >
        <Form
          onSubmit={cerrarCaja}
          noValidate
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Cerrar caja
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Alert variant="info">
              Efectivo esperado:{' '}
              <strong>
                {mostrarMoneda(
                  resumen?.efectivo_esperado,
                )}
              </strong>
            </Alert>

            <Form.Group className="mb-3">
              <Form.Label>
                Efectivo contado
              </Form.Label>

              <Form.Control
                type="number"
                value={montoFinalReal}
                onChange={(evento) =>
                  establecerMontoFinalReal(
                    evento.target.value,
                  )
                }
                min="0"
                step="0.01"
                isInvalid={Boolean(
                  errorMonto,
                )}
                required
              />

              <Form.Control.Feedback type="invalid">
                {errorMonto}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>
                Observaciones
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                value={observaciones}
                onChange={(evento) =>
                  establecerObservaciones(
                    evento.target.value,
                  )
                }
                maxLength={500}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                establecerMostrandoCierre(
                  false,
                )
              }
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="danger"
              disabled={
                guardando ||
                montoFinalReal === ''
              }
            >
              {guardando
                ? 'Cerrando...'
                : 'Confirmar cierre'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}