import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import './autenticacion.css'

/*
 * Valores iniciales del formulario de inicio de sesión.
 */
const FORMULARIO_INICIAL = {
  email: '',
  password: '',
}

/**
 * Muestra el formulario para iniciar sesión en Altamora Café.
 */
export default function InicioSesion() {
  const {
    iniciarSesion,
    estaAutenticado,
  } = useAutenticacion()

  const navegar = useNavigate()
  const ubicacion = useLocation()

  // Almacena la información escrita por el usuario.
  const [formulario, establecerFormulario] =
    useState(FORMULARIO_INICIAL)

  // Almacena los errores enviados por Laravel.
  const [errores, establecerErrores] = useState({})

  // Muestra errores generales de autenticación o conexión.
  const [mensajeError, establecerMensajeError] =
    useState('')

  // Evita enviar varias veces el formulario.
  const [procesando, establecerProcesando] =
    useState(false)

  // Controla si la contraseña puede verse temporalmente.
  const [
    mostrarContrasena,
    establecerMostrarContrasena,
  ] = useState(false)

  /**
   * Actualiza el campo correspondiente del formulario.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target

    establecerFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }))

    /*
     * Eliminamos el error del campo cuando el usuario
     * empieza a corregir su información.
     */
    establecerErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: undefined,
    }))

    establecerMensajeError('')
  }

  /**
   * Envía las credenciales a Laravel.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    establecerProcesando(true)
    establecerErrores({})
    establecerMensajeError('')

    try {
      await iniciarSesion({
        email: formulario.email.trim(),
        password: formulario.password,
      })

      /*
       * Si el usuario intentó abrir previamente una ruta
       * protegida, regresamos a ella. En caso contrario,
       * lo enviamos al panel principal.
       */
      const destino =
        ubicacion.state?.desde ?? '/panel'

      navegar(destino, {
        replace: true,
      })
    } catch (error) {
      /*
       * Laravel responde con 422 cuando existen errores
       * específicos en los campos del formulario.
       */
      if (error.estado === 422) {
        establecerErrores(
          error.datos?.errors ?? {},
        )

        return
      }

      /*
       * Los errores 401 corresponden normalmente a
       * credenciales que no coinciden.
       */
      establecerMensajeError(
        error.message ??
          'No fue posible iniciar sesión.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  /*
   * Una persona autenticada no necesita volver
   * a visualizar el formulario de acceso.
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
            Sistema integral de gestión
          </p>

          <h2>
            Administra cada detalle de tu cafetería
            desde un solo lugar.
          </h2>

          <p>
            Controla usuarios, productos, inventario,
            pedidos y operaciones con información clara,
            segura y organizada.
          </p>

          <div className="autenticacion-beneficios">
            <article>
              <strong>Gestión segura</strong>
              <span>
                Acceso protegido mediante Laravel Sanctum.
              </span>
            </article>

            <article>
              <strong>Información centralizada</strong>
              <span>
                Toda la operación de Altamora en una
                plataforma.
              </span>
            </article>
          </div>
        </div>

        <p className="autenticacion-pie-presentacion">
          Altamora Café · Calidad en cada proceso
        </p>
      </section>

      <section className="autenticacion-formulario-seccion">
        <div className="autenticacion-formulario-contenedor">
          <header className="autenticacion-encabezado">
            <p>Bienvenido nuevamente</p>
            <h2>Iniciar sesión</h2>

            <span>
              Ingresa tus credenciales para acceder al
              sistema.
            </span>
          </header>

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
                  value={formulario.email}
                  onChange={manejarCambio}
                  placeholder="usuario@altamora.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errores.email)}
                  aria-describedby={
                    errores.email
                      ? 'error-email'
                      : undefined
                  }
                  disabled={procesando}
                />
              </div>

              {errores.email && (
                <p
                  id="error-email"
                  className="autenticacion-mensaje-campo"
                >
                  {errores.email[0]}
                </p>
              )}
            </div>

            <div className="autenticacion-campo">
              <div className="autenticacion-fila-etiqueta">
                <label htmlFor="password">
                  Contraseña
                </label>

                <Link to="/recuperar-contrasena">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

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
                    mostrarContrasena
                      ? 'text'
                      : 'password'
                  }
                  value={formulario.password}
                  onChange={manejarCambio}
                  placeholder="Escribe tu contraseña"
                  autoComplete="current-password"
                  aria-invalid={Boolean(
                    errores.password,
                  )}
                  aria-describedby={
                    errores.password
                      ? 'error-password'
                      : undefined
                  }
                  disabled={procesando}
                />

                <button
                  type="button"
                  className="autenticacion-mostrar"
                  onClick={() =>
                    establecerMostrarContrasena(
                      (estadoActual) =>
                        !estadoActual,
                    )
                  }
                  aria-label={
                    mostrarContrasena
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  disabled={procesando}
                >
                  {mostrarContrasena
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              {errores.password && (
                <p
                  id="error-password"
                  className="autenticacion-mensaje-campo"
                >
                  {errores.password[0]}
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
                ? 'Iniciando sesión...'
                : 'Iniciar sesión'}
            </button>
          </form>

          <div className="autenticacion-separador">
            <span />
            <p>Cuenta nueva</p>
            <span />
          </div>

          <p className="autenticacion-enlace-registro">
            ¿Aún no tienes una cuenta?{' '}
            <Link to="/registro">
              Crear una cuenta
            </Link>
          </p>

          <footer className="autenticacion-pie-formulario">
            <span aria-hidden="true">◆</span>
            Conexión protegida y datos cifrados
          </footer>
        </div>
      </section>
    </main>
  )
}