import {
  Badge,
  Button,
  Card,
  Col,
  Row,
} from 'react-bootstrap'
import { Link } from 'react-router'
import { useAutenticacion } from '../contextos/useAutenticacion.js'

const MODULOS = [
  {
    titulo: 'Pedidos',
    descripcion:
      'Consulta y administra los pedidos registrados.',
    ruta: '/pedidos',
    abreviatura: 'PE',
    roles: [
      'administrador',
      'gerente',
      'empleado',
    ],
  },
  {
    titulo: 'Categorías',
    descripcion:
      'Organiza los productos disponibles en la cafetería.',
    ruta: '/categorias',
    abreviatura: 'CA',
    roles: [
      'administrador',
      'gerente',
    ],
  },
  {
    titulo: 'Productos',
    descripcion:
      'Registra, edita y consulta los productos.',
    ruta: '/productos',
    abreviatura: 'PR',
    roles: [
      'administrador',
      'gerente',
    ],
  },
  {
    titulo: 'Usuarios',
    descripcion:
      'Administra las cuentas y los roles del sistema.',
    ruta: '/usuarios',
    abreviatura: 'US',
    roles: [
      'administrador',
    ],
  },
]

/**
 * Convierte el rol guardado en un nombre legible.
 */
function obtenerRolLegible(rol) {
  const nombres = {
    administrador: 'Administrador',
    gerente: 'Gerente',
    empleado: 'Empleado',
  }

  return nombres[rol] ?? 'Usuario'
}

/**
 * Panel principal mostrado después de iniciar sesión.
 */
export default function PanelPrincipal() {
  const {
    usuario,
  } = useAutenticacion()

  const modulosPermitidos = MODULOS.filter(
    (modulo) => modulo.roles.includes(usuario?.rol),
  )

  return (
    <section className="altamora-dashboard">
      <header className="altamora-dashboard-presentacion">
        <div>
          <Badge
            bg="light"
            text="dark"
            className="altamora-dashboard-etiqueta"
          >
            Panel principal
          </Badge>

          <h1>
            Bienvenido,{' '}
            {usuario?.nombre ?? 'Usuario'}
          </h1>

          <p>
            Selecciona una opción para comenzar
            a trabajar en el sistema.
          </p>
        </div>

        <Badge className="altamora-dashboard-rol">
          {obtenerRolLegible(usuario?.rol)}
        </Badge>
      </header>

      <Card className="altamora-dashboard-usuario">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col xs={12} md>
              <small>Usuario autenticado</small>

              <strong>
                {usuario?.nombre ?? 'Usuario'}
              </strong>
            </Col>

            <Col xs={12} md>
              <small>Correo electrónico</small>

              <strong>
                {usuario?.correo ??
                  'Correo no disponible'}
              </strong>
            </Col>

            <Col xs={12} md="auto">
              <small>Rol actual</small>

              <strong>
                {obtenerRolLegible(usuario?.rol)}
              </strong>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="altamora-dashboard-seccion">
        <div>
          <h2>Módulos disponibles</h2>

          <p>
            Las opciones cambian según los permisos
            asignados a tu cuenta.
          </p>
        </div>
      </div>

      <Row className="g-4">
        {modulosPermitidos.map((modulo) => (
          <Col
            key={modulo.ruta}
            xs={12}
            md={6}
            xl={4}
          >
            <Card className="altamora-dashboard-tarjeta h-100">
              <Card.Body>
                <div className="altamora-dashboard-icono">
                  {modulo.abreviatura}
                </div>

                <Card.Title>
                  {modulo.titulo}
                </Card.Title>

                <Card.Text>
                  {modulo.descripcion}
                </Card.Text>

                <Button
                  as={Link}
                  to={modulo.ruta}
                  className="altamora-dashboard-boton"
                >
                  Abrir módulo
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="altamora-dashboard-aviso">
        <Card.Body>
          <strong>
            Sistema de Gestión Altamora
          </strong>

          <p className="mb-0">
            Utiliza el menú lateral o las tarjetas
            para navegar entre las funciones disponibles.
          </p>
        </Card.Body>
      </Card>
    </section>
  )
}