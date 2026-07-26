
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAutenticacion } from '../contextos/useAutenticacion.js'
/**
 * Página protegida utilizada para comprobar la autenticación.
 * El dashboard definitivo se desarrollará posteriormente.
 */
export default function PanelPrincipal() {
  const {
    usuario,
    cerrarSesion,
  } = useAutenticacion()

  const navegar = useNavigate()

  // Evita presionar varias veces el botón de cierre de sesión.
  const [cerrandoSesion, establecerCerrandoSesion] =
    useState(false)

  /**
   * Cierra la sesión en Laravel y regresa al formulario de acceso.
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

        <h1>Sesión iniciada correctamente</h1>

        <p>
          Esta es una página protegida. Solamente puede
          visualizarse cuando existe un token válido de
          Laravel Sanctum.
        </p>

        <div className="panel-prueba-usuario">
          <span>Usuario autenticado</span>

          <strong>
            {usuario?.nombre ?? 'Usuario'}
          </strong>

          <small>
            {usuario?.correo ?? 'Correo no disponible'}
          </small>
        </div>

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