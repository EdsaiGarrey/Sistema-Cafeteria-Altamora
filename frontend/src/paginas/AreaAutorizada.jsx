import { Link } from 'react-router'
import { useAutenticacion } from '../contextos/useAutenticacion.js'

/**
 * Página temporal para comprobar que el usuario
 * tiene autorización para entrar a una sección.
 */
export default function AreaAutorizada({
  etiqueta,
  titulo,
  descripcion,
}) {
  const { usuario } = useAutenticacion()

  return (
    <main className="area-autorizada">
      <section className="area-autorizada-contenido">
        <p className="area-autorizada-etiqueta">
          {etiqueta}
        </p>

        <h1>{titulo}</h1>

        <p className="area-autorizada-descripcion">
          {descripcion}
        </p>

        <div className="area-autorizada-usuario">
          <div>
            <span>Usuario</span>
            <strong>
              {usuario?.nombre ?? 'Usuario autenticado'}
            </strong>
          </div>

          <div>
            <span>Rol autorizado</span>
            <strong>
              {usuario?.rol ?? 'Rol no disponible'}
            </strong>
          </div>
        </div>

        <Link
          className="area-autorizada-boton"
          to="/panel"
        >
          Regresar al panel
        </Link>
      </section>
    </main>
  )
}