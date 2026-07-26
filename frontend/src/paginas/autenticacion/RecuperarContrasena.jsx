import { useState } from 'react'
import {
  Link,
  Navigate,
} from 'react-router'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiAutenticacion } from '../../servicios/api.js'
import './autenticacion.css'

/**
 * Muestra el formulario para solicitar el enlace
 * de recuperación de contraseña.
 */
export default function RecuperarContrasena() {
  const {
    estaAutenticado,
  } = useAutenticacion()

  // Correo electrónico escrito por el usuario.
  const [email, establecerEmail] = useState('')

  // Errores específicos enviados por Laravel.
  const [errores, establecerErrores] = useState({})

  // Mensaje general cuando ocurre un problema.
  const [mensajeError, establecerMensajeError] =
    useState('')

  // Mensaje mostrado cuando Laravel procesa la solicitud.
  const [mensajeExito, establecerMensajeExito] =
    useState('')

  // Evita enviar el formulario varias veces.
  const [procesando, establecerProcesando] =
    useState(false)

  /**
   * Actualiza el correo y elimina los mensajes anteriores.
   */
  function manejarCambio(evento) {
    establecerEmail(evento.target.value)
    establecerErrores({})
    establecerMensajeError('')
    establecerMensajeExito('')
  }

  /**
   * Solicita a Laravel el enlace de recuperación.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    establecerProcesando(true)
    establecerErrores({})
    establecerMensajeError('')
    establecerMensajeExito('')

    try {
      const respuesta =
        await apiAutenticacion.recuperarContrasena({
          email: email.trim(),
        })

      establecerMensajeExito(
        respuesta.mensaje ??
          'El enlace de recuperación fue generado correctamente.',
      )
    } catch (error) {
      /*
       * Los errores 422 contienen mensajes relacionados
       * con los campos del formulario.
       */
      if (error.estado === 422) {
        establecerErrores(
          error.datos?.errors ?? {},
        )

        establecerMensajeError(
          error.datos?.mensaje ??
            error.message,
        )

        return
      }

      establecerMensajeError(
        error.message ??
          'No fue posible solicitar la recuperación.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  /*
   * Una persona autenticada no necesita recuperar
   * su contraseña desde esta pantalla.
   */
  if (estaAutenticado) {
    return <Navigate to="/panel" replace />
  }

  return (
    <main className="autenticacion-pagina">
      <section className="autenticacion-presentacion">
        <div className="autenticacion-marca">
          <span
            className="autenticacion-logotipo"
            aria-hidden="true"
          >
            A
          </span>

          <div>
            <p className="autenticacion-marca-superior">
              Cafetería
            </p>

            <h1>Altamora</h1>
          </div>
        </div>

        <div className="autenticacion-presentacion-contenido">
          <p className="autenticacion-etiqueta">
            Recuperación segura
          </p>

          <h2>
            Recupera el acceso a tu cuenta de manera
            sencilla y segura.
          </h2>

          <p>
            Proporciona el correo asociado con tu cuenta.
            Recibirás un enlace temporal para establecer
            una contraseña nueva.
          </p>

          <div className="autenticacion-beneficios">
            <article>
              <strong>Enlace temporal</strong>

              <span>
                El token de recuperación solamente podrá
                utilizarse durante un tiempo limitado.
              </span>
            </article>

            <article>
              <strong>Sesiones protegidas</strong>

              <span>
                Las sesiones anteriores se eliminarán al
                cambiar la contraseña.
              </span>
            </article>
          </div>
        </div>

        <p className="autenticacion-pie-presentacion">
          Altamora Café · Seguridad en cada proceso
        </p>
      </section>

      <section className="autenticacion-formulario-seccion">
        <div className="autenticacion-formulario-contenedor">
          <header className="autenticacion-encabezado">
            <p>Recuperación de acceso</p>

            <h2>¿Olvidaste tu contraseña?</h2>

            <span>
              Escribe tu correo para recibir el enlace de
              recuperación.
            </span>
          </header>

          {mensajeExito && (
            <div
              className="autenticacion-alerta autenticacion-alerta-exito"
              role="status"
            >
              <span aria-hidden="true">✓</span>

              <p>{mensajeExito}</p>
            </div>
          )}

          {mensajeError && (
            <div
              className="autenticacion-alerta autenticacion-alerta-error"
              role="alert"
            >
              <span aria-hidden="true">!</span>

              <p>{mensajeError}</p>
            </div>
          )}

          <form
            className="autenticacion-formulario"
            onSubmit={manejarEnvio}
            noValidate
          >
            <div className="autenticacion-campo">
              <label htmlFor="email">
                Correo electrónico
              </label>

              <div
                className={`autenticacion-entrada ${
                  errores.email
                    ? 'autenticacion-entrada-error'
                    : ''
                }`}
              >
                <span aria-hidden="true">@</span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={manejarCambio}
                  placeholder="usuario@altamora.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errores.email)}
                  aria-describedby={
                    errores.email
                      ? 'error-email-recuperacion'
                      : undefined
                  }
                  disabled={procesando}
                />
              </div>

              {errores.email && (
                <p
                  id="error-email-recuperacion"
                  className="autenticacion-mensaje-campo"
                >
                  {errores.email[0]}
                </p>
              )}
            </div>

            <button
              className="autenticacion-boton-principal"
              type="submit"
              disabled={procesando}
            >
              {procesando && (
                <span
                  className="autenticacion-cargador"
                  aria-hidden="true"
                />
              )}

              {procesando
                ? 'Enviando enlace...'
                : 'Enviar enlace de recuperación'}
            </button>
          </form>

          <div className="autenticacion-separador">
            <span />
            <p>Regresar</p>
            <span />
          </div>

          <p className="autenticacion-enlace-registro">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/inicio-sesion">
              Iniciar sesión
            </Link>
          </p>

          <footer className="autenticacion-pie-formulario">
            <span aria-hidden="true">◆</span>
            Recuperación protegida por Laravel
          </footer>
        </div>
      </section>
    </main>
  )
}