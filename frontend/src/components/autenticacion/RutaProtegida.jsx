import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'

/**
 * Protege las páginas que requieren una sesión válida.
 */
export default function RutaProtegida() {
  const {
    estaAutenticado,
    cargandoSesion,
  } = useAutenticacion()

  // Recuperamos la dirección que el usuario intentó visitar.
  const ubicacion = useLocation()

  /*
   * Mientras React comprueba el token guardado, mostramos
   * una pantalla temporal para evitar redirecciones incorrectas.
   */
  if (cargandoSesion) {
    return (
      <main
        className="pantalla-carga-sesion"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="indicador-carga" />

        <p>Comprobando tu sesión...</p>
      </main>
    )
  }

  /*
   * Cuando no existe una sesión válida, enviamos al usuario
   * hacia el formulario de inicio de sesión.
   */
  if (!estaAutenticado) {
    const rutaSolicitada =
      `${ubicacion.pathname}${ubicacion.search}`

    return (
      <Navigate
        to="/inicio-sesion"
        replace
        state={{
          desde: rutaSolicitada,
        }}
      />
    )
  }

  /*
   * Outlet mostrará la página protegida que coincida
   * con la dirección actual del navegador.
   */
  return <Outlet />
}