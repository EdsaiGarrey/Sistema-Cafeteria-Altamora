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
import FormularioProducto from '../../components/productos/FormularioProducto.jsx'
import ConfirmarProducto from '../../components/productos/ConfirmarProducto.jsx'
import { apiCategorias } from '../../servicios/categorias.js'
import { apiProductos } from '../../servicios/productos.js'
import './productos.css'

const FORMULARIO_INICIAL = {
  categoria_id: '',
  nombre: '',
  descripcion: '',
  precio: '',
  imagen: '',
  activo: true,
}

/**
 * Convierte el precio al formato de México.
 */
function mostrarPrecio(precio) {
  return Number(precio ?? 0).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
    },
  )
}

/**
 * Administración de productos de la cafetería.
 */
export default function Productos() {
  const [
    productos,
    establecerProductos,
  ] = useState([])

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
    productoEditando,
    establecerProductoEditando,
  ] = useState(null)

  const [
    productoEliminando,
    establecerProductoEliminando,
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
    eliminando,
    establecerEliminando,
  ] = useState(false)

  /**
   * Consulta productos y categorías.
   */
  const cargarDatos = useCallback(async () => {
    establecerCargando(true)
    establecerError('')

    try {
      const [
        respuestaProductos,
        respuestaCategorias,
      ] = await Promise.all([
        apiProductos.listar(),
        apiCategorias.listar(),
      ])

      establecerProductos(
        respuestaProductos.data ?? [],
      )

      establecerCategorias(
        respuestaCategorias.data ?? [],
      )
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarDatos()
  }, [cargarDatos])

  /**
   * Abre el formulario vacío.
   */
  function abrirCreacion() {
    establecerProductoEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Abre el formulario con los datos del producto.
   */
  function abrirEdicion(producto) {
    establecerProductoEditando(producto)

    establecerFormulario({
      categoria_id: String(
        producto.categoria_id,
      ),
      nombre: producto.nombre,
      descripcion:
        producto.descripcion ?? '',
      precio: producto.precio,
      imagen: producto.imagen ?? '',
      activo: producto.activo,
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
    establecerProductoEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
  }

  /**
   * Actualiza un campo del formulario.
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
   * Registra o actualiza un producto.
   */
  async function guardarProducto(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerError('')
    establecerMensaje('')
    establecerErroresFormulario({})

    const datos = {
      categoria_id:
        formulario.categoria_id === ''
          ? null
          : Number(formulario.categoria_id),

      nombre: formulario.nombre.trim(),

      descripcion:
        formulario.descripcion.trim() || null,

      precio:
        formulario.precio === ''
          ? null
          : Number(formulario.precio),

      imagen:
        formulario.imagen.trim() || null,

      activo: formulario.activo,
    }

    try {
      const respuesta = productoEditando
        ? await apiProductos.actualizar(
            productoEditando.id,
            datos,
          )
        : await apiProductos.crear(datos)

      establecerMensaje(respuesta.mensaje)

      establecerMostrandoFormulario(false)
      establecerProductoEditando(null)
      establecerFormulario(FORMULARIO_INICIAL)
      establecerErroresFormulario({})

      await cargarDatos()
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
   * Elimina el producto seleccionado.
   */
  async function eliminarProducto() {
    if (!productoEliminando) {
      return
    }

    establecerEliminando(true)
    establecerError('')
    establecerMensaje('')

    try {
      const respuesta =
        await apiProductos.eliminar(
          productoEliminando.id,
        )

      establecerMensaje(respuesta.mensaje)
      establecerProductoEliminando(null)

      await cargarDatos()
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerEliminando(false)
    }
  }

  return (
    <section className="productos-vista">
      <header className="productos-encabezado">
        <div>
          <h1>Productos</h1>

          <p>
            Administra el catálogo disponible
            en la cafetería.
          </p>
        </div>

        <Button
          type="button"
          className="productos-boton-principal"
          onClick={abrirCreacion}
        >
          Nuevo producto
        </Button>
      </header>

      <Card className="productos-resumen">
        <Card.Body>
          <small>Productos registrados</small>

          <strong>{productos.length}</strong>
        </Card.Body>
      </Card>

      {mensaje && (
        <Alert variant="success">
          {mensaje}
        </Alert>
      )}

      {error &&
        !mostrandoFormulario &&
        !productoEliminando && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

      <Card className="productos-tabla-tarjeta">
        {cargando ? (
          <Card.Body className="productos-estado">
            <Spinner animation="border" />

            <span>Cargando productos...</span>
          </Card.Body>
        ) : productos.length === 0 ? (
          <Card.Body className="productos-estado">
            No hay productos registrados.
          </Card.Body>
        ) : (
          <Table
            responsive
            hover
            className="mb-0 align-middle"
          >
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <strong>
                      {producto.nombre}
                    </strong>

                    <small className="d-block text-muted">
                      {producto.descripcion ||
                        'Sin descripción'}
                    </small>
                  </td>

                  <td>
                    {producto.categoria?.nombre ||
                      'Sin categoría'}
                  </td>

                  <td className="productos-precio">
                    {mostrarPrecio(producto.precio)}
                  </td>

                  <td>
                    <Badge
                      bg={
                        producto.activo
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {producto.activo
                        ? 'Activo'
                        : 'Inactivo'}
                    </Badge>
                  </td>

                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline-primary"
                        onClick={() =>
                          abrirEdicion(producto)
                        }
                      >
                        Editar
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline-danger"
                        onClick={() => {
                          establecerProductoEliminando(
                            producto,
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

      <FormularioProducto
        mostrar={mostrandoFormulario}
        productoEditando={productoEditando}
        categorias={categorias}
        formulario={formulario}
        errores={erroresFormulario}
        error={
          mostrandoFormulario
            ? error
            : ''
        }
        guardando={guardando}
        alCambiar={manejarCampo}
        alGuardar={guardarProducto}
        alCerrar={cerrarFormulario}
      />

      <ConfirmarProducto
        producto={productoEliminando}
        error={
          productoEliminando
            ? error
            : ''
        }
        eliminando={eliminando}
        alConfirmar={eliminarProducto}
        alCerrar={() => {
          if (!eliminando) {
            establecerProductoEliminando(null)
            establecerError('')
          }
        }}
      />
    </section>
  )
}