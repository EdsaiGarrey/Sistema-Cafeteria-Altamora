import { useState } from 'react'
import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router'
import {
  Button,
  Image,
  Offcanvas,
  Spinner,
} from 'react-bootstrap'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import logoAltamora from '../../assets/altamora/logo-altamora.png'
import '../../estilos/panel-altamora.css'

const OPCIONES = [
  {
    ruta: '/panel',
    texto: 'Panel principal',
    roles: [
      'administrador',
      'gerente',
      'empleado',
    ],
  },
  {
    ruta: '/pedidos',
    texto: 'Pedidos',
    roles: [
      'administrador',
      'gerente',
      'empleado',
    ],
  },
  {
    ruta: '/categorias',
    texto: 'Categorías',
    roles: [
      'administrador',
      'gerente',
    ],
  },
  {
    ruta: '/productos',
    texto: 'Productos',
    roles: [
      'administrador',
      'gerente',
    ],
  },
  {
    ruta: '/usuarios',
    texto: 'Usuarios',
    roles: [
      'administrador',
    ],
  },
]

/**
 * Convierte el nombre del rol en texto legible.
 */
function obtenerRolLegible(rol) {
  const roles = {
    administrador: 'Administrador',
    gerente: 'Gerente',
    empleado: 'Empleado',
  }

  return roles[rol] ?? 'Usuario'
}

/**
 * Contenido reutilizable del menú.
 */
function ContenidoMenu({
  usuario,
  cerrandoSesion,
  alSeleccionar,
  alCerrarSesion,
}) {
  const opcionesPermitidas = OPCIONES.filter(
    (opcion) => opcion.roles.includes(usuario?.rol),
  )

  return (
    <>
      <header className="altamora-menu-logo">
        <Image
          src={logoAltamora}
          alt="Logo de Café Altamora"
        />

        <strong>Café Altamora</strong>
      </header>

      <nav
        className="altamora-menu-opciones"
        aria-label="Menú principal"
      >
        {opcionesPermitidas.map((opcion) => (
          <NavLink
            key={opcion.ruta}
            to={opcion.ruta}
            end={opcion.ruta === '/panel'}
            onClick={alSeleccionar}
            className={({ isActive }) =>
              isActive
                ? 'altamora-menu-enlace activo'
                : 'altamora-menu-enlace'
            }
          >
            {opcion.texto}
          </NavLink>
        ))}
      </nav>

      <div className="altamora-menu-usuario">
        <small>Sesión iniciada como</small>

        <strong>
          {usuario?.nombre ?? 'Usuario'}
        </strong>

        <span>
          {obtenerRolLegible(usuario?.rol)}
        </span>
      </div>

      <Button
        type="button"
        className="altamora-menu-cerrar"
        onClick={alCerrarSesion}
        disabled={cerrandoSesion}
      >
        {cerrandoSesion && (
          <Spinner
            size="sm"
            className="me-2"
            aria-hidden="true"
          />
        )}

        {cerrandoSesion
          ? 'Cerrando sesión...'
          : 'Cerrar sesión'}
      </Button>
    </>
  )
}

/**
 * Estructura general de todas las páginas protegidas.
 */
export default function DisenoPanel() {
  const {
    usuario,
    cerrarSesion,
  } = useAutenticacion()

  const navegar = useNavigate()

  const [
    mostrandoMenu,
    establecerMostrandoMenu,
  ] = useState(false)

  const [
    cerrandoSesion,
    establecerCerrandoSesion,
  ] = useState(false)

  /**
   * Cierra la sesión y regresa al acceso.
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
    <div className="altamora-panel">
      <aside className="altamora-menu d-none d-lg-flex">
        <ContenidoMenu
          usuario={usuario}
          cerrandoSesion={cerrandoSesion}
          alCerrarSesion={manejarCierreSesion}
        />
      </aside>

      <section className="altamora-panel-principal">
        <header className="altamora-encabezado">
          <Button
            type="button"
            className="altamora-boton-menu d-lg-none"
            onClick={() =>
              establecerMostrandoMenu(true)
            }
            aria-label="Abrir menú"
          >
            ☰
          </Button>

          <div>
            <small>Bienvenido</small>

            <strong>
              {usuario?.nombre ?? 'Usuario'}
            </strong>
          </div>

          <span className="altamora-encabezado-rol">
            {obtenerRolLegible(usuario?.rol)}
          </span>
        </header>

        <main className="altamora-panel-contenido">
          <Outlet />
        </main>
      </section>

      <Offcanvas
        show={mostrandoMenu}
        onHide={() =>
          establecerMostrandoMenu(false)
        }
        placement="start"
        className="altamora-menu-movil"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Menú principal
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <ContenidoMenu
            usuario={usuario}
            cerrandoSesion={cerrandoSesion}
            alSeleccionar={() =>
              establecerMostrandoMenu(false)
            }
            alCerrarSesion={manejarCierreSesion}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}