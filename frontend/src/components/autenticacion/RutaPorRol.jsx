import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'

/**
 * Protege un conjunto de rutas según el rol del usuario.
 */
export default function RutaPorRol({
  rolesPermitidos = [],
}) {
  const {
    usuario,
    estaAutenticado,
    cargandoSesion,
  } = useAutenticacion()

  const ubicacion = useLocation()

  /*
   * Esperamos mientras React comprueba el token
   * guardado y recupera el perfil desde Laravel.
   */
  if (cargandoSesion) {
    return (
      <main
        className="pantalla-carga-sesion"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="indicador-carga" />

        <p>Comprobando permisos...</p>
      </main>
    )
  }

  /*
   * Esta comprobación protege el componente aunque
   * accidentalmente se utilice fuera de RutaProtegida.
   */
  if (!estaAutenticado) {
    return (
      <Navigate
        to="/inicio-sesion"
        replace
        state={{
          desde:
            `${ubicacion.pathname}${ubicacion.search}`,
        }}
      />
    )
  }

  const rolActual = usuario?.rol

  /*
   * Cuando el rol no está autorizado, enviamos al usuario
   * hacia una página informativa de acceso denegado.
   */
  if (
    !rolActual ||
    !rolesPermitidos.includes(rolActual)
  ) {
    return (
      <Navigate
        to="/acceso-denegado"
        replace
        state={{
          desde:
            `${ubicacion.pathname}${ubicacion.search}`,
          rolActual,
          rolesPermitidos,
        }}
      />
    )
  }

  // El usuario tiene permiso para visualizar la ruta hija.
  return <Outlet />
}