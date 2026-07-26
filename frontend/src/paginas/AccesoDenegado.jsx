import {
  Link,
  useLocation,
} from 'react-router'
import { useAutenticacion } from '../contextos/useAutenticacion.js'
import './acceso-denegado.css'

/**
 * Informa que el usuario inició sesión,
 * pero no tiene el rol necesario.
 */
export default function AccesoDenegado() {
  const { usuario } = useAutenticacion()
  const ubicacion = useLocation()

  const rolActual =
    ubicacion.state?.rolActual ??
    usuario?.rol ??
    'sin rol'

  const rutaSolicitada =
    ubicacion.state?.desde ?? 'Ruta desconocida'

  return (
    <main className="acceso-denegado">
      <section className="acceso-denegado-contenido">
        <span
          className="acceso-denegado-codigo"
          aria-hidden="true"
        >
          403
        </span>

        <p className="acceso-denegado-marca">
          Altamora Café
        </p>

        <h1>Acceso no autorizado</h1>

        <p className="acceso-denegado-descripcion">
          Tu sesión es válida, pero tu rol no tiene permiso
          para entrar a esta sección del sistema.
        </p>

        <div className="acceso-denegado-detalles">
          <div>
            <span>Usuario</span>

            <strong>
              {usuario?.nombre ?? 'Usuario autenticado'}
            </strong>
          </div>

          <div>
            <span>Rol actual</span>

            <strong>{rolActual}</strong>
          </div>

          <div>
            <span>Ruta solicitada</span>

            <strong>{rutaSolicitada}</strong>
          </div>
        </div>

        <Link
          className="acceso-denegado-boton"
          to="/panel"
          replace
        >
          Regresar al panel
        </Link>
      </section>
    </main>
  )
}