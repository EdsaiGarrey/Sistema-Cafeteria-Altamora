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
  Spinner,
  Table,
} from 'react-bootstrap'
import FormularioCategoria from '../../components/categorias/FormularioCategoria.jsx'
import ConfirmarCategoria from '../../components/categorias/ConfirmarCategoria.jsx'
import { apiCategorias } from '../../servicios/categorias.js'
import './categorias.css'

const FORMULARIO_INICIAL = {
  nombre: '',
  descripcion: '',
  activo: true,
}

/**
 * Administración de categorías de productos.
 */
export default function Categorias() {
  const [
    categorias,
    establecerCategorias,
  ] = useState([])

  const [
    cargando,
    establecerCargando,
  ] = useState(true)

  const [error, establecerError] = useState('')
  const [mensaje, establecerMensaje] = useState('')

  const [
    mostrandoFormulario,
    establecerMostrandoFormulario,
  ] = useState(false)

  const [
    categoriaEditando,
    establecerCategoriaEditando,
  ] = useState(null)

  const [
    formulario,
    establecerFormulario,
  ] = useState(FORMULARIO_INICIAL)

  const [
    erroresFormulario,
    establecerErroresFormulario,
  ] = useState({})

  const [
    guardando,
    establecerGuardando,
  ] = useState(false)

  const [
    categoriaEliminando,
    establecerCategoriaEliminando,
  ] = useState(null)

  const [
    eliminando,
    establecerEliminando,
  ] = useState(false)

  /**
   * Consulta las categorías almacenadas.
   */
  const cargarCategorias = useCallback(async () => {
    establecerCargando(true)
    establecerError('')

    try {
      const respuesta =
        await apiCategorias.listar()

      establecerCategorias(
        respuesta.data ?? [],
      )
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarCategorias()
  }, [cargarCategorias])

  /**
   * Abre el formulario vacío.
   */
  function abrirCreacion() {
    establecerCategoriaEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Abre el formulario con los datos seleccionados.
   */
  function abrirEdicion(categoria) {
    establecerCategoriaEditando(categoria)

    establecerFormulario({
      nombre: categoria.nombre,
      descripcion:
        categoria.descripcion ?? '',
      activo: categoria.activo,
    })

    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Cierra y limpia el formulario.
   */
  function cerrarFormulario() {
    if (guardando) {
      return
    }

    establecerMostrandoFormulario(false)
    establecerCategoriaEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
  }

  /**
   * Actualiza los campos del formulario.
   */
  function manejarCampo(evento) {
    const {
      name,
      value,
      type,
      checked,
    } = evento.target

    establecerFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox'
        ? checked
        : value,
    }))

    establecerErroresFormulario((actuales) => ({
      ...actuales,
      [name]: undefined,
    }))
  }

  /**
   * Registra o actualiza una categoría.
   */
  async function guardarCategoria(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerError('')
    establecerMensaje('')
    establecerErroresFormulario({})

    const datos = {
      nombre: formulario.nombre.trim(),
      descripcion:
        formulario.descripcion.trim() || null,
      activo: formulario.activo,
    }

    try {
      const respuesta = categoriaEditando
        ? await apiCategorias.actualizar(
            categoriaEditando.id,
            datos,
          )
        : await apiCategorias.crear(datos)

      establecerMensaje(respuesta.mensaje)

      establecerMostrandoFormulario(false)
      establecerCategoriaEditando(null)
      establecerFormulario(FORMULARIO_INICIAL)
      establecerErroresFormulario({})

      await cargarCategorias()
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)

      establecerErroresFormulario(
        errorPeticion.datos?.errors ?? {},
      )
    } finally {
      establecerGuardando(false)
    }
  }

  /**
   * Elimina la categoría seleccionada.
   */
  async function eliminarCategoria() {
    if (!categoriaEliminando) {
      return
    }

    establecerEliminando(true)
    establecerError('')
    establecerMensaje('')

    try {
      const respuesta =
        await apiCategorias.eliminar(
          categoriaEliminando.id,
        )

      establecerMensaje(respuesta.mensaje)
      establecerCategoriaEliminando(null)

      await cargarCategorias()
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerEliminando(false)
    }
  }

  return (
    <section className="categorias-vista">
      <header className="categorias-encabezado">
        <div>
          <h1>Categorías</h1>

          <p>
            Organiza los productos disponibles
            en la cafetería.
          </p>
        </div>

        <Button
          type="button"
          className="categorias-boton-principal"
          onClick={abrirCreacion}
        >
          Nueva categoría
        </Button>
      </header>

      <Card className="categorias-resumen">
        <Card.Body>
          <small>Categorías registradas</small>

          <strong>{categorias.length}</strong>
        </Card.Body>
      </Card>

      {mensaje && (
        <Alert variant="success">
          {mensaje}
        </Alert>
      )}

      {error &&
        !mostrandoFormulario &&
        !categoriaEliminando && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

      <Card className="categorias-tabla-tarjeta">
        {cargando ? (
          <Card.Body className="categorias-estado">
            <Spinner animation="border" />

            <span>Cargando categorías...</span>
          </Card.Body>
        ) : categorias.length === 0 ? (
          <Card.Body className="categorias-estado">
            No hay categorías registradas.
          </Card.Body>
        ) : (
          <Table
            responsive
            hover
            className="mb-0 align-middle"
          >
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>
                    <strong>
                      {categoria.nombre}
                    </strong>

                    <small className="d-block text-muted">
                      {categoria.slug}
                    </small>
                  </td>

                  <td>
                    {categoria.descripcion ||
                      'Sin descripción'}
                  </td>

                  <td>
                    <Badge
                      bg={
                        categoria.activo
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {categoria.activo
                        ? 'Activa'
                        : 'Inactiva'}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          abrirEdicion(categoria)
                        }
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          establecerCategoriaEliminando(
                            categoria,
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

      <FormularioCategoria
        mostrar={mostrandoFormulario}
        categoriaEditando={categoriaEditando}
        formulario={formulario}
        errores={erroresFormulario}
        error={
          mostrandoFormulario
            ? error
            : ''
        }
        guardando={guardando}
        alCambiar={manejarCampo}
        alGuardar={guardarCategoria}
        alCerrar={cerrarFormulario}
      />

      <ConfirmarCategoria
        categoria={categoriaEliminando}
        error={
          categoriaEliminando
            ? error
            : ''
        }
        eliminando={eliminando}
        alConfirmar={eliminarCategoria}
        alCerrar={() => {
          if (!eliminando) {
            establecerCategoriaEliminando(null)
            establecerError('')
          }
        }}
      />
    </section>
  )
}