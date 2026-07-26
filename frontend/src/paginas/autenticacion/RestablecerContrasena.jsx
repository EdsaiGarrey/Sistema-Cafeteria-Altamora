import { useState } from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router'
import { apiAutenticacion } from '../../servicios/api.js'
import './autenticacion.css'

/**
 * Permite establecer una contraseña nueva utilizando
 * el token recibido mediante el enlace de recuperación.
 */
export default function RestablecerContrasena() {
  const [parametrosBusqueda] = useSearchParams()

  /*
   * Recuperamos el token y el correo que Laravel agregó
   * al enlace enviado mediante la notificación.
   */
  const token = parametrosBusqueda.get('token') ?? ''
  const email = parametrosBusqueda.get('email') ?? ''

  // Datos escritos en el formulario.
  const [formulario, establecerFormulario] = useState({
    password: '',
    password_confirmation: '',
  })

  // Errores específicos enviados por Laravel.
  const [errores, establecerErrores] = useState({})

  // Mensaje general cuando ocurre un problema.
  const [mensajeError, establecerMensajeError] =
    useState('')

  // Mensaje mostrado cuando la contraseña cambia.
  const [mensajeExito, establecerMensajeExito] =
    useState('')

  // Evita enviar varias solicitudes simultáneas.
  const [procesando, establecerProcesando] =
    useState(false)

  // Impide volver a utilizar el formulario exitoso.
  const [restablecimientoCompleto, establecerRestablecimientoCompleto] =
    useState(false)

  // Permite mostrar u ocultar las contraseñas.
  const [
    mostrarContrasenas,
    establecerMostrarContrasenas,
  ] = useState(false)

  /**
   * Actualiza el campo correspondiente.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target

    establecerFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }))

    establecerErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: undefined,
    }))

    establecerMensajeError('')
  }

  /**
   * Envía el token, correo y contraseña nueva a Laravel.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    /*
     * El formulario no puede funcionar si la dirección
     * fue abierta sin token o sin correo electrónico.
     */
    if (!token || !email) {
      establecerMensajeError(
        'El enlace de recuperación está incompleto. Solicita uno nuevo.',
      )

      return
    }

    establecerProcesando(true)
    establecerErrores({})
    establecerMensajeError('')
    establecerMensajeExito('')

    try {
      const respuesta =
        await apiAutenticacion.restablecerContrasena({
          token,
          email,
          password: formulario.password,
          password_confirmation:
            formulario.password_confirmation,
        })

      establecerMensajeExito(
        respuesta.mensaje ??
          'La contraseña fue restablecida correctamente.',
      )

      establecerRestablecimientoCompleto(true)

      establecerFormulario({
        password: '',
        password_confirmation: '',
      })
    } catch (error) {
      /*
       * Laravel utiliza el código 422 para errores
       * de validación, token inválido o token expirado.
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
          'No fue posible restablecer la contraseña.',
      )
    } finally {
      establecerProcesando(false)
    }
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
            Nueva contraseña
          </p>

          <h2>
            Protege nuevamente tu cuenta con una contraseña
            segura.
          </h2>

          <p>
            Define una contraseña nueva que no hayas utilizado
            anteriormente y conserva tus datos de acceso en un
            lugar seguro.
          </p>

          <div className="autenticacion-beneficios">
            <article>
              <strong>Contraseña protegida</strong>

              <span>
                Laravel almacenará la nueva contraseña mediante
                un hash seguro.
              </span>
            </article>

            <article>
              <strong>Sesiones renovadas</strong>

              <span>
                Los tokens anteriores se eliminarán después del
                cambio.
              </span>
            </article>
          </div>
        </div>

        <p className="autenticacion-pie-presentacion">
          Altamora Café · Seguridad en cada acceso
        </p>
      </section>

      <section className="autenticacion-formulario-seccion">
        <div className="autenticacion-formulario-contenedor">
          <header className="autenticacion-encabezado">
            <p>Restablecimiento de acceso</p>

            <h2>Nueva contraseña</h2>

            <span>
              Establece una contraseña segura para recuperar
              tu cuenta.
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

          {!token || !email ? (
            <div
              className="autenticacion-alerta autenticacion-alerta-error"
              role="alert"
            >
              <span aria-hidden="true">!</span>

              <p>
                El enlace no contiene los datos necesarios.
                Solicita un enlace de recuperación nuevo.
              </p>
            </div>
          ) : (
            <form
              className="autenticacion-formulario"
              onSubmit={manejarEnvio}
              noValidate
            >
              <div className="autenticacion-campo">
                <label htmlFor="email-restablecimiento">
                  Correo electrónico
                </label>

                <div className="autenticacion-entrada">
                  <span aria-hidden="true">@</span>

                  <input
                    id="email-restablecimiento"
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                  />
                </div>
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="password">
                  Nueva contraseña
                </label>

                <div
                  className={`autenticacion-entrada ${
                    errores.password
                      ? 'autenticacion-entrada-error'
                      : ''
                  }`}
                >
                  <span aria-hidden="true">●</span>

                  <input
                    id="password"
                    name="password"
                    type={
                      mostrarContrasenas
                        ? 'text'
                        : 'password'
                    }
                    value={formulario.password}
                    onChange={manejarCambio}
                    placeholder="Escribe la nueva contraseña"
                    autoComplete="new-password"
                    aria-invalid={Boolean(
                      errores.password,
                    )}
                    aria-describedby={
                      errores.password
                        ? 'error-password-restablecimiento'
                        : 'ayuda-password-restablecimiento'
                    }
                    disabled={
                      procesando ||
                      restablecimientoCompleto
                    }
                  />

                  <button
                    type="button"
                    className="autenticacion-mostrar"
                    onClick={() =>
                      establecerMostrarContrasenas(
                        (estadoActual) =>
                          !estadoActual,
                      )
                    }
                    disabled={
                      procesando ||
                      restablecimientoCompleto
                    }
                  >
                    {mostrarContrasenas
                      ? 'Ocultar'
                      : 'Mostrar'}
                  </button>
                </div>

                <p
                  id="ayuda-password-restablecimiento"
                  className="autenticacion-ayuda-campo"
                >
                  Mínimo 8 caracteres, mayúscula, minúscula,
                  número y carácter especial.
                </p>

                {errores.password && (
                  <p
                    id="error-password-restablecimiento"
                    className="autenticacion-mensaje-campo"
                  >
                    {errores.password[0]}
                  </p>
                )}
              </div>

              <div className="autenticacion-campo">
                <label htmlFor="password_confirmation">
                  Confirmar contraseña
                </label>

                <div className="autenticacion-entrada">
                  <span aria-hidden="true">●</span>

                  <input
                    id="password_confirmation"
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
                    placeholder="Repite la nueva contraseña"
                    autoComplete="new-password"
                    disabled={
                      procesando ||
                      restablecimientoCompleto
                    }
                  />
                </div>
              </div>

              <button
                className="autenticacion-boton-principal"
                type="submit"
                disabled={
                  procesando ||
                  restablecimientoCompleto
                }
              >
                {procesando && (
                  <span
                    className="autenticacion-cargador"
                    aria-hidden="true"
                  />
                )}

                {procesando
                  ? 'Restableciendo contraseña...'
                  : restablecimientoCompleto
                    ? 'Contraseña actualizada'
                    : 'Restablecer contraseña'}
              </button>
            </form>
          )}

          <div className="autenticacion-separador">
            <span />
            <p>Continuar</p>
            <span />
          </div>

          <p className="autenticacion-enlace-registro">
            {restablecimientoCompleto
              ? 'Tu contraseña ya fue actualizada. '
              : '¿Necesitas otro enlace? '}

            <Link
              to={
                restablecimientoCompleto
                  ? '/inicio-sesion'
                  : '/recuperar-contrasena'
              }
            >
              {restablecimientoCompleto
                ? 'Iniciar sesión'
                : 'Solicitar recuperación'}
            </Link>
          </p>

          <footer className="autenticacion-pie-formulario">
            <span aria-hidden="true">◆</span>
            Restablecimiento protegido por Laravel
          </footer>
        </div>
      </section>
    </main>
  )
}