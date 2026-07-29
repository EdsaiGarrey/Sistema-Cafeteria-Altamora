import { useState } from 'react'
import {
  Link,
  Navigate,
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
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

/**
 * Formulario público para crear una cuenta.
 */
export default function Registro() {
  const {
    registrar,
    estaAutenticado,
     usuario,
  } = useAutenticacion()

  const navegar = useNavigate()

  const [formulario, establecerFormulario] =
    useState(FORMULARIO_INICIAL)

  const [errores, establecerErrores] = useState({})

  const [
    mensajeError,
    establecerMensajeError,
  ] = useState('')

  const [
    procesando,
    establecerProcesando,
  ] = useState(false)

  const [
    mostrarContrasenas,
    establecerMostrarContrasenas,
  ] = useState(false)

  /**
   * Actualiza el campo escrito y limpia su error.
   */
  function manejarCambio(evento) {
    const {
      name,
      value,
    } = evento.target

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

  /**
   * Envía la información a la API de Laravel.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    establecerProcesando(true)
    establecerErrores({})
    establecerMensajeError('')

    try {
      const respuesta = await registrar({
        name: formulario.name.trim(),
        email: formulario.email.trim(),
        password: formulario.password,
        password_confirmation:
          formulario.password_confirmation,
      })

      /*
       * Laravel devuelve el token al registrar,
       * por lo que la sesión comienza automáticamente.
       */
      navegar('/correo-pendiente', {
  replace: true,
  state: {
    correo: respuesta.usuario?.correo,
  },
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
          'No fue posible crear la cuenta.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  /*
   * Una persona autenticada no necesita
   * abrir nuevamente el registro público.
   */
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
      titulo="Crear cuenta"
      descripcion="Registra tus datos para acceder a Café Altamora."
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
        <Form.Group controlId="name">
          <Form.Label>
            Nombre completo
          </Form.Label>

          <Form.Control
            name="name"
            type="text"
            value={formulario.name}
            onChange={manejarCambio}
            placeholder="Escribe tu nombre"
            autoComplete="name"
            isInvalid={Boolean(errores.name)}
            disabled={procesando}
          />

          <Form.Control.Feedback type="invalid">
            {errores.name?.[0]}
          </Form.Control.Feedback>
        </Form.Group>

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
          <Form.Label>
            Contraseña
          </Form.Label>

          <InputGroup>
            <Form.Control
              name="password"
              type={
                mostrarContrasenas
                  ? 'text'
                  : 'password'
              }
              value={formulario.password}
              onChange={manejarCambio}
              placeholder="Crea una contraseña"
              autoComplete="new-password"
              isInvalid={Boolean(errores.password)}
              disabled={procesando}
            />

            <Button
              type="button"
              variant="outline-secondary"
              onClick={() =>
                establecerMostrarContrasenas(
                  (actual) => !actual,
                )
              }
              disabled={procesando}
            >
              {mostrarContrasenas
                ? 'Ocultar'
                : 'Mostrar'}
            </Button>

            <Form.Control.Feedback type="invalid">
              {errores.password?.[0]}
            </Form.Control.Feedback>
          </InputGroup>

          <Form.Text className="text-muted">
            Usa mínimo 8 caracteres, mayúscula,
            minúscula, número y símbolo.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="password_confirmation">
          <Form.Label>
            Confirmar contraseña
          </Form.Label>

          <Form.Control
            name="password_confirmation"
            type={
              mostrarContrasenas
                ? 'text'
                : 'password'
            }
            value={
              formulario.password_confirmation
            }
            onChange={manejarCambio}
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            disabled={procesando}
          />
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
            ? 'Creando cuenta...'
            : 'Guardar'}
        </Button>

        <Link
          to="/inicio-sesion"
          className={
            'btn altamora-auth-boton-secundario'
          }
        >
          Iniciar sesión
        </Link>
      </Form>
    </DisenoAutenticacion>
  )
}