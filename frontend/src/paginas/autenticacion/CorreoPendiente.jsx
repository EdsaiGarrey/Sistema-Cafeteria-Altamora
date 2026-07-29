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
    cerrarSesion,
  } = useAutenticacion()

  const navegar = useNavigate()

  const [procesando, establecerProcesando] =
    useState(false)

  const [comprobando, establecerComprobando] =
    useState(false)

  const [cerrandoSesion, establecerCerrandoSesion] =
    useState(false)

  const [mensaje, establecerMensaje] = useState('')
  const [error, establecerError] = useState('')

  /**
   * Solicita a Laravel el reenvío del correo de verificación.
   */
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

  /**
   * Consulta nuevamente al servidor para comprobar
   * si el correo electrónico ya fue verificado.
   */
  async function comprobarVerificacion() {
    establecerComprobando(true)
    establecerMensaje('')
    establecerError('')

    try {
      const respuesta =
        await apiAutenticacion.obtenerPerfil()

      establecerUsuario(respuesta.usuario)

      if (respuesta.usuario?.correo_verificado_en) {
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

  /**
   * Elimina la sesión y regresa al formulario de inicio.
   */
  async function volverAlInicioSesion() {
    establecerCerrandoSesion(true)
    establecerMensaje('')
    establecerError('')

    try {
      await cerrarSesion()
    } finally {
      navegar('/inicio-sesion', {
        replace: true,
      })
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
          disabled={
            comprobando ||
            procesando ||
            cerrandoSesion
          }
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
          disabled={
            procesando ||
            comprobando ||
            cerrandoSesion
          }
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

        <Button
          type="button"
          variant="outline-danger"
          onClick={volverAlInicioSesion}
          disabled={
            cerrandoSesion ||
            procesando ||
            comprobando
          }
        >
          {cerrandoSesion && (
            <Spinner
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
          )}

          {cerrandoSesion
            ? 'Cerrando sesión...'
            : 'Cerrar sesión y volver al inicio'}
        </Button>
      </div>
    </DisenoAutenticacion>
  )
}
