import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router'
import { useAutenticacion } from '../contextos/useAutenticacion.js'

/**
 * Panel temporal para comprobar la autenticación
 * y la autorización según el rol.
 */
export default function PanelPrincipal() {
  const {
    usuario,
    cerrarSesion,
  } = useAutenticacion()

  const navegar = useNavigate()

  const [cerrandoSesion, establecerCerrandoSesion] =
    useState(false)

  const puedeGestionar = [
    'administrador',
    'gerente',
  ].includes(usuario?.rol)

  const puedeAdministrar =
    usuario?.rol === 'administrador'

  /**
   * Cierra la sesión y regresa al formulario de acceso.
   */
  async function manejarCierreSesion() {
    establecerCerrandoSesion(true)

    try {
      await cerrarSesion()

      navegar('/inicio-sesion', {
        replace: true,
      })
    } finally {
      establecerCerrandoSesion(false)
    }
  }

  return (
    <main className="panel-prueba">
      <section className="panel-prueba-contenido">
        <p className="panel-prueba-etiqueta">
          Altamora Café
        </p>

        <h1>Panel según tu rol</h1>

        <p>
          Las opciones disponibles cambian dependiendo
          del nivel de autorización del usuario.
        </p>

        <div className="panel-prueba-usuario">
          <span>Usuario autenticado</span>

          <strong>
            {usuario?.nombre ?? 'Usuario'}
          </strong>

          <small>
            {usuario?.correo ?? 'Correo no disponible'}
          </small>

          <small>
            Rol: {usuario?.rol ?? 'No disponible'}
          </small>
        </div>

        <nav
          className="panel-prueba-opciones"
          aria-label="Secciones disponibles"
        >
          {/* Disponible para los tres roles. */}
          <Link to="/area-operativa">
            Área operativa
          </Link>

          {/* Solamente administrador y gerente. */}
          {puedeGestionar && (
            <Link to="/area-gestion">
              Área de gestión
            </Link>
          )}

          {/* Solamente administrador. */}
          {puedeAdministrar && (
            <Link to="/area-administracion">
              Área administrativa
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={manejarCierreSesion}
          disabled={cerrandoSesion}
        >
          {cerrandoSesion
            ? 'Cerrando sesión...'
            : 'Cerrar sesión'}
        </button>
      </section>
    </main>
  )
}