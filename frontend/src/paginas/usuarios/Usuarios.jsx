import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap'
import FormularioUsuario from '../../components/usuarios/FormularioUsuario.jsx'
import ConfirmarEliminacion from '../../components/usuarios/ConfirmarEliminacion.jsx'
import { apiUsuarios } from '../../servicios/usuarios.js'
import './usuarios.css'

const FILTROS_INICIALES = {
  buscar: '',
  role: '',
}

const FORMULARIO_INICIAL = {
  name: '',
  email: '',
  role: 'empleado',
  password: '',
  password_confirmation: '',
}

/**
 * Convierte el rol técnico en texto legible.
 */
function mostrarRol(rol) {
  const roles = {
    administrador: 'Administrador',
    gerente: 'Gerente',
    empleado: 'Empleado',
  }

  return roles[rol] ?? rol
}

/**
 * Define el color del distintivo del rol.
 */
function colorRol(rol) {
  const colores = {
    administrador: 'primary',
    gerente: 'warning',
    empleado: 'secondary',
  }

  return colores[rol] ?? 'secondary'
}

/**
 * Muestra una fecha en formato mexicano.
 */
function mostrarFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

/**
 * Administración de cuentas del sistema.
 */
export default function Usuarios() {
  const [usuarios, establecerUsuarios] = useState([])

  const [meta, establecerMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  const [filtros, establecerFiltros] =
    useState(FILTROS_INICIALES)

  const [
    filtrosAplicados,
    establecerFiltrosAplicados,
  ] = useState(FILTROS_INICIALES)

  const [pagina, establecerPagina] = useState(1)
  const [cargando, establecerCargando] = useState(true)
  const [error, establecerError] = useState('')
  const [mensaje, establecerMensaje] = useState('')

  const [
    mostrandoFormulario,
    establecerMostrandoFormulario,
  ] = useState(false)

  const [
    usuarioEditando,
    establecerUsuarioEditando,
  ] = useState(null)

  const [formulario, establecerFormulario] =
    useState(FORMULARIO_INICIAL)

  const [
    erroresFormulario,
    establecerErroresFormulario,
  ] = useState({})

  const [guardando, establecerGuardando] =
    useState(false)

  const [
    usuarioEliminando,
    establecerUsuarioEliminando,
  ] = useState(null)

  const [eliminando, establecerEliminando] =
    useState(false)

  /**
   * Consulta usuarios con filtros y paginación.
   */
  const cargarUsuarios = useCallback(
    async (parametros) => {
      establecerCargando(true)
      establecerError('')

      try {
        const respuesta = await apiUsuarios.listar({
          ...parametros,
          por_pagina: 10,
        })

        establecerUsuarios(respuesta.data ?? [])

        establecerMeta(
          respuesta.meta ?? {
            current_page: 1,
            last_page: 1,
            total: 0,
          },
        )
      } catch (errorPeticion) {
        establecerError(errorPeticion.message)
      } finally {
        establecerCargando(false)
      }
    },
    [],
  )

  useEffect(() => {
    void cargarUsuarios({
      ...filtrosAplicados,
      page: pagina,
    })
  }, [
    cargarUsuarios,
    filtrosAplicados,
    pagina,
  ])

  function manejarFiltro(evento) {
    const { name, value } = evento.target

    establecerFiltros((actuales) => ({
      ...actuales,
      [name]: value,
    }))
  }

  function aplicarFiltros(evento) {
    evento.preventDefault()
    establecerPagina(1)
    establecerFiltrosAplicados(filtros)
  }

  function limpiarFiltros() {
    establecerFiltros(FILTROS_INICIALES)
    establecerFiltrosAplicados(FILTROS_INICIALES)
    establecerPagina(1)
  }

  function abrirCreacion() {
    establecerUsuarioEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  function abrirEdicion(usuario) {
    establecerUsuarioEditando(usuario)

    establecerFormulario({
      name: usuario.nombre,
      email: usuario.correo,
      role: usuario.rol,
      password: '',
      password_confirmation: '',
    })

    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  function cerrarFormulario() {
    if (guardando) {
      return
    }

    establecerMostrandoFormulario(false)
    establecerUsuarioEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
  }

  function manejarFormulario(evento) {
    const { name, value } = evento.target

    establecerFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))

    establecerErroresFormulario((actuales) => ({
      ...actuales,
      [name]: undefined,
      password:
        name === 'password_confirmation'
          ? undefined
          : actuales.password,
    }))
  }

  async function guardarUsuario(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerError('')
    establecerMensaje('')
    establecerErroresFormulario({})

    const datos = {
      name: formulario.name.trim(),
      email: formulario.email.trim(),
      role: formulario.role,
    }

    if (
      !usuarioEditando ||
      formulario.password !== ''
    ) {
      datos.password = formulario.password
      datos.password_confirmation =
        formulario.password_confirmation
    }

    try {
      const respuesta = usuarioEditando
        ? await apiUsuarios.actualizar(
            usuarioEditando.id,
            datos,
          )
        : await apiUsuarios.crear(datos)

      establecerMensaje(respuesta.mensaje)
      cerrarFormulario()

      await cargarUsuarios({
        ...filtrosAplicados,
        page: pagina,
      })
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)

      establecerErroresFormulario(
        errorPeticion.datos?.errors ?? {},
      )
    } finally {
      establecerGuardando(false)
    }
  }

  async function eliminarUsuario() {
    if (!usuarioEliminando) {
      return
    }

    establecerEliminando(true)
    establecerError('')
    establecerMensaje('')

    try {
      const respuesta = await apiUsuarios.eliminar(
        usuarioEliminando.id,
      )

      establecerMensaje(respuesta.mensaje)
      establecerUsuarioEliminando(null)

      const paginaDestino =
        usuarios.length === 1 && pagina > 1
          ? pagina - 1
          : pagina

      establecerPagina(paginaDestino)

      if (paginaDestino === pagina) {
        await cargarUsuarios({
          ...filtrosAplicados,
          page: paginaDestino,
        })
      }
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerEliminando(false)
    }
  }

  return (
    <section className="usuarios-vista">
      <header className="usuarios-encabezado">
        <div>
          <h1>Usuarios</h1>

          <p>
            Administra las cuentas y roles registrados.
          </p>
        </div>

        <Button
          type="button"
          className="usuarios-boton-principal"
          onClick={abrirCreacion}
        >
          Nuevo usuario
        </Button>
      </header>

      <Card className="usuarios-resumen">
        <Card.Body>
          <small>Usuarios registrados</small>
          <strong>{meta.total}</strong>
        </Card.Body>
      </Card>

      <Card className="usuarios-filtros">
        <Card.Body>
          <Form onSubmit={aplicarFiltros}>
            <Row className="g-3 align-items-end">
              <Col xs={12} md>
                <Form.Group controlId="buscar-usuario">
                  <Form.Label>
                    Nombre o correo
                  </Form.Label>

                  <Form.Control
                    name="buscar"
                    type="search"
                    value={filtros.buscar}
                    onChange={manejarFiltro}
                    placeholder="Buscar usuario..."
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group controlId="filtrar-role">
                  <Form.Label>Rol</Form.Label>

                  <Form.Select
                    name="role"
                    value={filtros.role}
                    onChange={manejarFiltro}
                  >
                    <option value="">
                      Todos los roles
                    </option>

                    <option value="administrador">
                      Administrador
                    </option>

                    <option value="gerente">
                      Gerente
                    </option>

                    <option value="empleado">
                      Empleado
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md="auto">
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    className="usuarios-boton-principal"
                  >
                    Buscar
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={limpiarFiltros}
                  >
                    Limpiar
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {mensaje && (
        <Alert variant="success">
          {mensaje}
        </Alert>
      )}

      {error &&
        !mostrandoFormulario &&
        !usuarioEliminando && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

      <Card className="usuarios-tabla-tarjeta">
        {cargando ? (
          <Card.Body className="usuarios-estado">
            <Spinner animation="border" />

            <span>Cargando usuarios...</span>
          </Card.Body>
        ) : usuarios.length === 0 ? (
          <Card.Body className="usuarios-estado">
            No se encontraron usuarios.
          </Card.Body>
        ) : (
          <Table
            responsive
            hover
            className="mb-0 align-middle"
          >
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.nombre}</strong>

                    <small className="d-block text-muted">
                      ID: {usuario.id}
                    </small>
                  </td>

                  <td>{usuario.correo}</td>

                  <td>
                    <Badge bg={colorRol(usuario.rol)}>
                      {mostrarRol(usuario.rol)}
                    </Badge>
                  </td>

                  <td>
                    {mostrarFecha(usuario.creado_en)}
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          abrirEdicion(usuario)
                        }
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          establecerUsuarioEliminando(
                            usuario,
                          )
                          establecerError('')
                          establecerMensaje('')
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <footer className="usuarios-paginacion">
        <Button
          type="button"
          variant="outline-secondary"
          disabled={
            cargando ||
            meta.current_page <= 1
          }
          onClick={() =>
            establecerPagina((actual) =>
              Math.max(1, actual - 1),
            )
          }
        >
          Anterior
        </Button>

        <span>
          Página {meta.current_page} de {meta.last_page}
        </span>

        <Button
          type="button"
          variant="outline-secondary"
          disabled={
            cargando ||
            meta.current_page >= meta.last_page
          }
          onClick={() =>
            establecerPagina((actual) =>
              Math.min(
                meta.last_page,
                actual + 1,
              ),
            )
          }
        >
          Siguiente
        </Button>
      </footer>

      <FormularioUsuario
        mostrar={mostrandoFormulario}
        usuarioEditando={usuarioEditando}
        formulario={formulario}
        errores={erroresFormulario}
        error={
          mostrandoFormulario
            ? error
            : ''
        }
        guardando={guardando}
        alCambiar={manejarFormulario}
        alGuardar={guardarUsuario}
        alCerrar={cerrarFormulario}
      />

      <ConfirmarEliminacion
        usuario={usuarioEliminando}
        error={
          usuarioEliminando
            ? error
            : ''
        }
        eliminando={eliminando}
        alConfirmar={eliminarUsuario}
        alCerrar={() => {
          if (!eliminando) {
            establecerUsuarioEliminando(null)
            establecerError('')
          }
        }}
      />
    </section>
  )
}