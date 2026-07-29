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
  Spinner,
} from 'react-bootstrap'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiCajas } from '../../servicios/cajas.js'

/**
 * Pantalla para consultar y abrir la caja.
 */
export default function Caja() {
  const { usuario } = useAutenticacion()

  const [
    cajaActiva,
    establecerCajaActiva,
  ] = useState(null)

  const [
    montoInicial,
    establecerMontoInicial,
  ] = useState('')

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

  const puedeAbrir = [
    'administrador',
    'gerente',
  ].includes(usuario?.rol)

  /**
   * Consulta si existe una caja abierta.
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
   * Registra la apertura de caja.
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
   * Convierte una fecha en texto legible.
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
          Consulta el estado de la caja
          y registra una nueva apertura.
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
            <Spinner
              animation="border"
              role="status"
            />

            <p className="mt-3 mb-0">
              Consultando caja...
            </p>
          </Card.Body>
        </Card>
      ) : cajaActiva ? (
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <strong>
              Caja activa
            </strong>

            <Badge bg="success">
              Abierta
            </Badge>
          </Card.Header>

          <Card.Body>
            <dl className="row mb-0">
              <dt className="col-sm-4">
                Número de caja
              </dt>

              <dd className="col-sm-8">
                #{cajaActiva.id}
              </dd>

              <dt className="col-sm-4">
                Monto inicial
              </dt>

              <dd className="col-sm-8">
                $
                {Number(
                  cajaActiva.monto_inicial,
                ).toFixed(2)}
              </dd>

              <dt className="col-sm-4">
                Responsable
              </dt>

              <dd className="col-sm-8">
                {cajaActiva
                  .usuario_apertura
                  ?.nombre ??
                  'No disponible'}
              </dd>

              <dt className="col-sm-4">
                Fecha de apertura
              </dt>

              <dd className="col-sm-8">
                {mostrarFecha(
                  cajaActiva.abierta_en,
                )}
              </dd>
            </dl>

            <Alert
              variant="info"
              className="mt-4 mb-0"
            >
              Debes cerrar esta caja antes
              de abrir una nueva.
            </Alert>
          </Card.Body>
        </Card>
      ) : puedeAbrir ? (
        <Card>
          <Card.Header>
            <strong>
              Abrir caja
            </strong>
          </Card.Header>

          <Card.Body>
            <Alert variant="warning">
              Actualmente no existe una caja
              abierta.
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
                  max="999999.99"
                  step="0.01"
                  isInvalid={Boolean(
                    errorMonto,
                  )}
                  placeholder="Ejemplo: 500.00"
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
                {guardando && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                )}

                {guardando
                  ? 'Abriendo caja...'
                  : 'Abrir caja'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">
          No existe una caja abierta.
          Solamente un administrador o gerente
          puede realizar la apertura.
        </Alert>
      )}
    </>
  )
}