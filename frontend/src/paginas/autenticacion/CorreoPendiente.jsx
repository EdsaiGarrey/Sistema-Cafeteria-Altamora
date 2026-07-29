import { useState } from 'react'
import {
  Alert,
  Button,
  Spinner,
} from 'react-bootstrap'
import { useNavigate } from 'react-router'
import DisenoAutenticacion from '../../components/autenticacion/DisenoAutenticacion.jsx'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiAutenticacion } from '../../servicios/api.js'

export default function CorreoPendiente() {
  const {
    usuario,
    establecerUsuario,
  } = useAutenticacion()

  const navegar = useNavigate()

  const [procesando, establecerProcesando] =
    useState(false)

  const [comprobando, establecerComprobando] =
    useState(false)

  const [mensaje, establecerMensaje] = useState('')
  const [error, establecerError] = useState('')

  async function reenviarCorreo() {
    establecerProcesando(true)
    establecerMensaje('')
    establecerError('')

    try {
      const respuesta =
        await apiAutenticacion.reenviarVerificacionCorreo()

      establecerMensaje(
        respuesta.mensaje ??
          'Se envió un nuevo enlace de verificación.',
      )
    } catch (errorSolicitud) {
      if (errorSolicitud.estado === 409) {
        await comprobarVerificacion()
        return
      }

      establecerError(
        errorSolicitud.message ??
          'No fue posible reenviar el correo.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  async function comprobarVerificacion() {
    establecerComprobando(true)
    establecerMensaje('')
    establecerError('')

    try {
      const respuesta =
        await apiAutenticacion.obtenerPerfil()

      establecerUsuario(respuesta.usuario)

      if (
        respuesta.usuario?.correo_verificado_en
      ) {
        navegar('/panel', {
          replace: true,
        })

        return
      }

      establecerError(
        'El correo todavía no aparece como verificado. Revisa el enlace recibido.',
      )
    } catch (errorSolicitud) {
      establecerError(
        errorSolicitud.message ??
          'No fue posible comprobar la verificación.',
      )
    } finally {
      establecerComprobando(false)
    }
  }

  return (
    <DisenoAutenticacion
      titulo="Revisa tu correo"
      descripcion="Confirma tu dirección para completar el registro en Café Altamora."
    >
      <Alert variant="info">
        Enviamos un enlace de verificación a:
        <strong className="d-block mt-1">
          {usuario?.correo ?? 'tu correo electrónico'}
        </strong>
      </Alert>

      <p className="text-muted">
        Abre el mensaje enviado por Altamora Café y presiona
        el botón de verificación. Revisa también la carpeta de
        correo no deseado.
      </p>

      {mensaje && (
        <Alert variant="success">
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <div className="d-grid gap-3">
        <Button
          type="button"
          className="altamora-auth-boton"
          onClick={comprobarVerificacion}
          disabled={comprobando || procesando}
        >
          {comprobando && (
            <Spinner
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
          )}

          {comprobando
            ? 'Comprobando...'
            : 'Ya verifiqué mi correo'}
        </Button>

        <Button
          type="button"
          variant="outline-secondary"
          onClick={reenviarCorreo}
          disabled={procesando || comprobando}
        >
          {procesando && (
            <Spinner
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
          )}

          {procesando
            ? 'Reenviando...'
            : 'Reenviar correo de verificación'}
        </Button>
      </div>
    </DisenoAutenticacion>
  )
}