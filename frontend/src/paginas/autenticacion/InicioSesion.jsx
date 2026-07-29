import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'
import {
  Alert,
  Button,
  Form,
  InputGroup,
  Spinner,
} from 'react-bootstrap'
import DisenoAutenticacion from '../../components/autenticacion/DisenoAutenticacion.jsx'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'

const FORMULARIO_INICIAL = {
  email: '',
  password: '',
}

/**
 * Formulario para iniciar sesión.
 */
export default function InicioSesion() {
  const {
    iniciarSesion,
    estaAutenticado,
    usuario,
  } = useAutenticacion()

  const navegar = useNavigate()
  const ubicacion = useLocation()

  const [formulario, establecerFormulario] =
    useState(FORMULARIO_INICIAL)

  const [errores, establecerErrores] = useState({})
  const [mensajeError, establecerMensajeError] =
    useState('')

  const [procesando, establecerProcesando] =
    useState(false)

  const [
    mostrarContrasena,
    establecerMostrarContrasena,
  ] = useState(false)

  function manejarCambio(evento) {
    const { name, value } = evento.target

    establecerFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))

    establecerErrores((actuales) => ({
      ...actuales,
      [name]: undefined,
    }))

    establecerMensajeError('')
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()

    establecerProcesando(true)
    establecerErrores({})
    establecerMensajeError('')

    try {
      const respuesta = await iniciarSesion({
        email: formulario.email.trim(),
        password: formulario.password,
      })

      const destino =
  respuesta.usuario?.correo_verificado_en
    ? ubicacion.state?.desde ?? '/panel'
    : '/correo-pendiente'

navegar(destino, {
  replace: true,
})
    } catch (error) {
      if (error.estado === 422) {
        establecerErrores(
          error.datos?.errors ?? {},
        )

        return
      }

      establecerMensajeError(
        error.message ??
          'No fue posible iniciar sesión.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  if (estaAutenticado) {
  return (
    <Navigate
      to={
        usuario?.correo_verificado_en
          ? '/panel'
          : '/correo-pendiente'
      }
      replace
    />
  )
}

  return (
    <DisenoAutenticacion
      titulo="Iniciar sesión"
      descripcion="Accede al sistema de gestión de Café Altamora."
    >
      {mensajeError && (
        <Alert variant="danger">
          {mensajeError}
        </Alert>
      )}

      <Form
        className="altamora-auth-formulario"
        onSubmit={manejarEnvio}
        noValidate
      >
        <Form.Group controlId="email">
          <Form.Label>
            Correo electrónico
          </Form.Label>

          <Form.Control
            name="email"
            type="email"
            value={formulario.email}
            onChange={manejarCambio}
            placeholder="usuario@altamora.com"
            autoComplete="email"
            isInvalid={Boolean(errores.email)}
            disabled={procesando}
          />

          <Form.Control.Feedback type="invalid">
            {errores.email?.[0]}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="password">
          <div className="d-flex justify-content-between">
            <Form.Label>Contraseña</Form.Label>

            <Link
              to="/recuperar-contrasena"
              className="altamora-auth-enlace"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <InputGroup>
            <Form.Control
              name="password"
              type={
                mostrarContrasena
                  ? 'text'
                  : 'password'
              }
              value={formulario.password}
              onChange={manejarCambio}
              placeholder="Escribe tu contraseña"
              autoComplete="current-password"
              isInvalid={Boolean(errores.password)}
              disabled={procesando}
            />

            <Button
              type="button"
              variant="outline-secondary"
              onClick={() =>
                establecerMostrarContrasena(
                  (actual) => !actual,
                )
              }
              disabled={procesando}
            >
              {mostrarContrasena
                ? 'Ocultar'
                : 'Mostrar'}
            </Button>

            <Form.Control.Feedback type="invalid">
              {errores.password?.[0]}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        <Button
          type="submit"
          className="altamora-auth-boton"
          disabled={procesando}
        >
          {procesando && (
            <Spinner
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
          )}

          {procesando
            ? 'Iniciando sesión...'
            : 'Iniciar sesión'}
        </Button>

        <Link
          to="/registro"
          className={
            'btn altamora-auth-boton-secundario'
          }
        >
          Crear cuenta
        </Link>
      </Form>
    </DisenoAutenticacion>
  )
}