import { useState } from 'react'
import {
  Link,
  Navigate,
} from 'react-router'
import {
  Alert,
  Button,
  Form,
  Spinner,
} from 'react-bootstrap'
import DisenoAutenticacion from '../../components/autenticacion/DisenoAutenticacion.jsx'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiAutenticacion } from '../../servicios/api.js'

/**
 * Solicita el enlace para recuperar
 * la contraseña de una cuenta.
 */
export default function RecuperarContrasena() {
  const {
    estaAutenticado,
  } = useAutenticacion()

  const [email, establecerEmail] = useState('')
  const [errorEmail, establecerErrorEmail] =
    useState('')

  const [
    mensajeError,
    establecerMensajeError,
  ] = useState('')

  const [
    mensajeExito,
    establecerMensajeExito,
  ] = useState('')

  const [
    procesando,
    establecerProcesando,
  ] = useState(false)

  /**
   * Actualiza el correo y limpia mensajes anteriores.
   */
  function manejarCambio(evento) {
    establecerEmail(evento.target.value)
    establecerErrorEmail('')
    establecerMensajeError('')
    establecerMensajeExito('')
  }

  /**
   * Envía el correo a la API de Laravel.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    establecerProcesando(true)
    establecerErrorEmail('')
    establecerMensajeError('')
    establecerMensajeExito('')

    try {
      const respuesta =
        await apiAutenticacion.recuperarContrasena({
          email: email.trim(),
        })

      establecerMensajeExito(
        respuesta.mensaje ??
          'El enlace de recuperación fue enviado.',
      )
    } catch (error) {
      const errores =
        error.datos?.errors ??
        error.datos?.errores ??
        {}

      if (error.estado === 422) {
        establecerErrorEmail(
          errores.email?.[0] ?? '',
        )
      }

      establecerMensajeError(
        error.datos?.mensaje ??
          error.message ??
          'No fue posible enviar el enlace.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  /*
   * Un usuario autenticado no necesita
   * recuperar su contraseña desde aquí.
   */
  if (estaAutenticado) {
    return <Navigate to="/panel" replace />
  }

  return (
    <DisenoAutenticacion
      titulo="Recuperar contraseña"
      descripcion="Escribe el correo asociado con tu cuenta."
    >
      {mensajeExito && (
        <Alert variant="success">
          <Alert.Heading className="fs-6">
            Solicitud realizada
          </Alert.Heading>

          <p className="mb-0">
            {mensajeExito}
          </p>
        </Alert>
      )}

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
        <Form.Group controlId="email-recuperacion">
          <Form.Label>
            Correo electrónico
          </Form.Label>

          <Form.Control
            name="email"
            type="email"
            value={email}
            onChange={manejarCambio}
            placeholder="usuario@altamora.com"
            autoComplete="email"
            isInvalid={Boolean(errorEmail)}
            disabled={procesando}
          />

          <Form.Control.Feedback type="invalid">
            {errorEmail}
          </Form.Control.Feedback>

          <Form.Text className="text-muted">
            Recibirás un enlace temporal para crear
            una contraseña nueva.
          </Form.Text>
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
            ? 'Enviando enlace...'
            : 'Enviar enlace de recuperación'}
        </Button>

        <Link
          to="/inicio-sesion"
          className={
            'btn altamora-auth-boton-secundario'
          }
        >
          Regresar al inicio de sesión
        </Link>
      </Form>
    </DisenoAutenticacion>
  )
}