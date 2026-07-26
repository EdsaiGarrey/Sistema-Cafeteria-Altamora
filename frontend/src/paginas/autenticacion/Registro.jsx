import { useState } from 'react'
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import './autenticacion.css'

/*
 * Estado inicial del formulario de registro.
 */
const FORMULARIO_INICIAL = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

/**
 * Muestra el formulario para registrar una cuenta.
 */
export default function Registro() {
  const {
    registrar,
    estaAutenticado,
  } = useAutenticacion()

  const navegar = useNavigate()

  // Información escrita en los campos.
  const [formulario, establecerFormulario] =
    useState(FORMULARIO_INICIAL)

  // Errores específicos enviados por Laravel.
  const [errores, establecerErrores] = useState({})

  // Error general de conexión o procesamiento.
  const [mensajeError, establecerMensajeError] =
    useState('')

  // Evita enviar el formulario varias veces.
  const [procesando, establecerProcesando] =
    useState(false)

  // Permite mostrar u ocultar ambas contraseñas.
  const [
    mostrarContrasenas,
    establecerMostrarContrasenas,
  ] = useState(false)

  /**
   * Actualiza el campo modificado.
   */
  function manejarCambio(evento) {
    const { name, value } = evento.target

    establecerFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }))

    // Elimina el error cuando el usuario corrige el campo.
    establecerErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: undefined,
    }))

    establecerMensajeError('')
  }

  /**
   * Envía el registro a Laravel.
   */
  async function manejarEnvio(evento) {
    evento.preventDefault()

    establecerProcesando(true)
    establecerErrores({})
    establecerMensajeError('')

    try {
      await registrar({
        name: formulario.name.trim(),
        email: formulario.email.trim(),
        password: formulario.password,
        password_confirmation:
          formulario.password_confirmation,
      })

      /*
       * El backend devuelve un token al registrar la cuenta,
       * por lo que la sesión inicia automáticamente.
       */
      navegar('/panel', {
        replace: true,
      })
    } catch (error) {
      // Laravel responde con 422 cuando falla la validación.
      if (error.estado === 422) {
        establecerErrores(
          error.datos?.errors ?? {},
        )

        return
      }

      establecerMensajeError(
        error.message ??
          'No fue posible registrar la cuenta.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  /*
   * Una persona autenticada no necesita registrar
   * otra cuenta desde esta pantalla.
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
            Comienza a gestionar Altamora de manera
            segura y organizada.
          </h2>

          <p>
            Crea tu cuenta para acceder a las herramientas
            de administración, inventario, productos,
            pedidos y operación de la cafetería.
          </p>

          <div className="autenticacion-beneficios">
            <article>
              <strong>Cuenta protegida</strong>

              <span>
                Contraseñas cifradas y autenticación mediante
                Laravel Sanctum.
              </span>
            </article>

            <article>
              <strong>Acceso centralizado</strong>

              <span>
                Consulta las funciones autorizadas desde una
                misma plataforma.
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
            <p>Registro de usuario</p>

            <h2>Crear una cuenta</h2>

            <span>
              Completa la información para acceder al sistema.
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
              <label htmlFor="name">
                Nombre completo
              </label>

              <div
                className={`autenticacion-entrada ${
                  errores.name
                    ? 'autenticacion-entrada-error'
                    : ''
                }`}
              >
                <span aria-hidden="true">◆</span>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formulario.name}
                  onChange={manejarCambio}
                  placeholder="Escribe tu nombre"
                  autoComplete="name"
                  aria-invalid={Boolean(errores.name)}
                  aria-describedby={
                    errores.name
                      ? 'error-name'
                      : undefined
                  }
                  disabled={procesando}
                />
              </div>

              {errores.name && (
                <p
                  id="error-name"
                  className="autenticacion-mensaje-campo"
                >
                  {errores.name[0]}
                </p>
              )}
            </div>

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
              <label htmlFor="password">
                Contraseña
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
                  placeholder="Crea una contraseña segura"
                  autoComplete="new-password"
                  aria-invalid={Boolean(
                    errores.password,
                  )}
                  aria-describedby={
                    errores.password
                      ? 'error-password'
                      : 'ayuda-password'
                  }
                  disabled={procesando}
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
                  disabled={procesando}
                >
                  {mostrarContrasenas
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>
              </div>

              <p
                id="ayuda-password"
                className="autenticacion-ayuda-campo"
              >
                Mínimo 8 caracteres, mayúscula, minúscula,
                número y carácter especial.
              </p>

              {errores.password && (
                <p
                  id="error-password"
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
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  disabled={procesando}
                />
              </div>
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
                ? 'Creando cuenta...'
                : 'Crear cuenta'}
            </button>
          </form>

          <div className="autenticacion-separador">
            <span />
            <p>Cuenta existente</p>
            <span />
          </div>

          <p className="autenticacion-enlace-registro">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/inicio-sesion">
              Iniciar sesión
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