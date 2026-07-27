import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
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
 * Pantalla para administrar productos.
 */
export default function Productos() {
  const navegar = useNavigate()

  const [productos, establecerProductos] = useState([])
  const [categorias, establecerCategorias] = useState([])
  const [cargando, establecerCargando] = useState(true)
  const [error, establecerError] = useState('')
  const [mensaje, establecerMensaje] = useState('')

  const [mostrandoFormulario, establecerMostrandoFormulario] =
    useState(false)

  const [productoEditando, establecerProductoEditando] =
    useState(null)

  const [productoEliminando, establecerProductoEliminando] =
    useState(null)

  const [formulario, establecerFormulario] =
    useState(FORMULARIO_INICIAL)

  const [erroresFormulario, establecerErroresFormulario] =
    useState({})

  const [guardando, establecerGuardando] = useState(false)
  const [eliminando, establecerEliminando] = useState(false)

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
   * Abre el formulario para registrar.
   */
  function abrirFormularioNuevo() {
    establecerProductoEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Abre el formulario para editar.
   */
  function abrirFormularioEditar(producto) {
    establecerProductoEditando(producto)

    establecerFormulario({
      categoria_id: String(producto.categoria_id),
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
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
   * Obtiene el primer error de validación.
   */
  function obtenerError(campo) {
    return erroresFormulario[campo]?.[0] ?? ''
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
      categoria_id: Number(formulario.categoria_id),
      nombre: formulario.nombre.trim(),
      descripcion:
        formulario.descripcion.trim() || null,
      precio: Number(formulario.precio),
      imagen: formulario.imagen.trim() || null,
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

    try {
      const respuesta = await apiProductos.eliminar(
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
    <main className="productos-pagina">
      <header className="productos-encabezado">
        <div>
          <p className="productos-marca">
            Altamora Café
          </p>

          <h1>Administración de productos</h1>

          <p>
            Registra los productos disponibles
            en la cafetería.
          </p>
        </div>

        <div className="productos-acciones">
          <button
            type="button"
            className="productos-boton-principal"
            onClick={abrirFormularioNuevo}
          >
            Nuevo producto
          </button>

          <button
            type="button"
            className="productos-boton-secundario"
            onClick={() => navegar('/panel')}
          >
            Regresar al panel
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="productos-alerta productos-exito">
          {mensaje}
        </div>
      )}

      {error &&
        !mostrandoFormulario &&
        !productoEliminando && (
          <div className="productos-alerta productos-error">
            {error}
          </div>
        )}

      {mostrandoFormulario && (
        <section className="productos-formulario-panel">
          <h2>
            {productoEditando
              ? 'Editar producto'
              : 'Registrar producto'}
          </h2>

          <form
            className="productos-formulario"
            onSubmit={guardarProducto}
          >
            {error && (
              <div className="productos-alerta productos-error">
                {error}
              </div>
            )}

            <div className="productos-campo">
              <label htmlFor="categoria_id">
                Categoría
              </label>

              <select
                id="categoria_id"
                name="categoria_id"
                value={formulario.categoria_id}
                onChange={manejarCampo}
              >
                <option value="">
                  Selecciona una categoría
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              {obtenerError('categoria_id') && (
                <small className="productos-error-campo">
                  {obtenerError('categoria_id')}
                </small>
              )}
            </div>

            <div className="productos-campo">
              <label htmlFor="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formulario.nombre}
                onChange={manejarCampo}
                placeholder="Ejemplo: Capuchino"
              />

              {obtenerError('nombre') && (
                <small className="productos-error-campo">
                  {obtenerError('nombre')}
                </small>
              )}
            </div>

            <div className="productos-campo">
              <label htmlFor="descripcion">
                Descripción
              </label>

              <textarea
                id="descripcion"
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCampo}
                rows="3"
              />
            </div>

            <div className="productos-campo">
              <label htmlFor="precio">
                Precio
              </label>

              <input
                id="precio"
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={formulario.precio}
                onChange={manejarCampo}
                placeholder="65.00"
              />

              {obtenerError('precio') && (
                <small className="productos-error-campo">
                  {obtenerError('precio')}
                </small>
              )}
            </div>

            <div className="productos-campo">
              <label htmlFor="imagen">
                URL de imagen
              </label>

              <input
                id="imagen"
                name="imagen"
                type="url"
                value={formulario.imagen}
                onChange={manejarCampo}
                placeholder="https://..."
              />

              {obtenerError('imagen') && (
                <small className="productos-error-campo">
                  {obtenerError('imagen')}
                </small>
              )}
            </div>

            <label className="productos-casilla">
              <input
                name="activo"
                type="checkbox"
                checked={formulario.activo}
                onChange={manejarCampo}
              />

              Producto activo
            </label>

            <div className="productos-formulario-acciones">
              <button
                type="button"
                className="productos-boton-secundario"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="productos-boton-principal"
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : productoEditando
                    ? 'Guardar cambios'
                    : 'Registrar producto'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="productos-contenedor">
        {cargando ? (
          <p className="productos-vacio">
            Cargando productos...
          </p>
        ) : productos.length === 0 ? (
          <p className="productos-vacio">
            No hay productos registrados.
          </p>
        ) : (
          <table className="productos-tabla">
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
                    <strong>{producto.nombre}</strong>

                    <small>
                      {producto.descripcion ||
                        'Sin descripción'}
                    </small>
                  </td>

                  <td>
                    {producto.categoria?.nombre ||
                      'Sin categoría'}
                  </td>

                  <td>
                    ${Number(producto.precio).toFixed(2)}
                  </td>

                  <td>
                    {producto.activo
                      ? 'Activo'
                      : 'Inactivo'}
                  </td>

                  <td>
                    <div className="productos-botones-tabla">
                      <button
                        type="button"
                        onClick={() =>
                          abrirFormularioEditar(producto)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          establecerProductoEliminando(
                            producto,
                          )
                          establecerMensaje('')
                          establecerError('')
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {productoEliminando && (
        <section className="productos-confirmacion">
          <h2>¿Eliminar producto?</h2>

          <p>
            Se eliminará{' '}
            <strong>
              {productoEliminando.nombre}
            </strong>.
          </p>

          {error && (
            <div className="productos-alerta productos-error">
              {error}
            </div>
          )}

          <div className="productos-formulario-acciones">
            <button
              type="button"
              className="productos-boton-secundario"
              onClick={() =>
                establecerProductoEliminando(null)
              }
              disabled={eliminando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="productos-boton-eliminar"
              onClick={eliminarProducto}
              disabled={eliminando}
            >
              {eliminando
                ? 'Eliminando...'
                : 'Sí, eliminar'}
            </button>
          </div>
        </section>
      )}
    </main>
  )
}