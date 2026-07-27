import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
import { apiCategorias } from '../../servicios/categorias.js'
import './categorias.css'

const FORMULARIO_INICIAL = {
  nombre: '',
  descripcion: '',
  activo: true,
}

/**
 * Pantalla para administrar categorías.
 */
export default function Categorias() {
  const navegar = useNavigate()

  const [categorias, establecerCategorias] = useState([])
  const [cargando, establecerCargando] = useState(true)
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

  const [formulario, establecerFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const [
    erroresFormulario,
    establecerErroresFormulario,
  ] = useState({})

  const [guardando, establecerGuardando] = useState(false)

  const [
    categoriaEliminando,
    establecerCategoriaEliminando,
  ] = useState(null)

  const [eliminando, establecerEliminando] =
    useState(false)

  /**
   * Consulta las categorías de Laravel.
   */
  const cargarCategorias = useCallback(async () => {
    establecerCargando(true)
    establecerError('')

    try {
      const respuesta = await apiCategorias.listar()

      establecerCategorias(respuesta.data ?? [])
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerCargando(false)
    }
  }, [])

  /**
   * Carga las categorías al abrir la página.
   */
  useEffect(() => {
    void cargarCategorias()
  }, [cargarCategorias])

  /**
   * Abre el formulario para registrar.
   */
  function abrirFormularioNuevo() {
    establecerCategoriaEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Abre el formulario para editar.
   */
  function abrirFormularioEditar(categoria) {
    establecerCategoriaEditando(categoria)

    establecerFormulario({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
      activo: categoria.activo,
    })

    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Cierra el formulario.
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
   * Obtiene el primer error de un campo.
   */
  function obtenerError(campo) {
    return erroresFormulario[campo]?.[0] ?? ''
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

      /*
       * Cierra y limpia el formulario
       * después de guardar correctamente.
       */
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
   * Abre la confirmación de eliminación.
   */
  function confirmarEliminacion(categoria) {
    establecerCategoriaEliminando(categoria)
    establecerError('')
    establecerMensaje('')
  }

  /**
   * Cancela la eliminación.
   */
  function cancelarEliminacion() {
    if (eliminando) {
      return
    }

    establecerCategoriaEliminando(null)
    establecerError('')
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

    try {
      const respuesta = await apiCategorias.eliminar(
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
    <main className="categorias-pagina">
      <header className="categorias-encabezado">
        <div>
          <p className="categorias-marca">
            Altamora Café
          </p>

          <h1>Categorías de productos</h1>

          <p>
            Organiza los productos del catálogo
            mediante categorías.
          </p>
        </div>

        <div className="categorias-acciones">
          <button
            type="button"
            className="categorias-boton-principal"
            onClick={abrirFormularioNuevo}
          >
            Nueva categoría
          </button>

          <button
            type="button"
            className="categorias-boton-secundario"
            onClick={() => navegar('/panel')}
          >
            Regresar al panel
          </button>
        </div>
      </header>

      {mensaje && (
        <div
          className={
            'categorias-alerta categorias-exito'
          }
        >
          {mensaje}
        </div>
      )}

      {error &&
        !mostrandoFormulario &&
        !categoriaEliminando && (
          <div
            className={
              'categorias-alerta categorias-error'
            }
          >
            {error}
          </div>
        )}

      {mostrandoFormulario && (
        <section className="categorias-formulario-panel">
          <div className="categorias-formulario-titulo">
            <div>
              <p className="categorias-marca">
                Gestión de categorías
              </p>

              <h2>
                {categoriaEditando
                  ? 'Editar categoría'
                  : 'Registrar categoría'}
              </h2>
            </div>

            <button
              type="button"
              className="categorias-cerrar"
              onClick={cerrarFormulario}
              disabled={guardando}
              aria-label="Cerrar formulario"
            >
              ×
            </button>
          </div>

          <form
            className="categorias-formulario"
            onSubmit={guardarCategoria}
          >
            {error && (
              <div
                className={
                  'categorias-alerta categorias-error'
                }
              >
                {error}
              </div>
            )}

            <div className="categorias-campo">
              <label htmlFor="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formulario.nombre}
                onChange={manejarCampo}
                placeholder="Ejemplo: Bebidas calientes"
              />

              {obtenerError('nombre') && (
                <small className="categorias-error-campo">
                  {obtenerError('nombre')}
                </small>
              )}
            </div>

            <div className="categorias-campo">
              <label htmlFor="descripcion">
                Descripción
              </label>

              <textarea
                id="descripcion"
                name="descripcion"
                value={formulario.descripcion}
                onChange={manejarCampo}
                placeholder="Describe brevemente la categoría"
                rows="4"
              />

              {obtenerError('descripcion') && (
                <small className="categorias-error-campo">
                  {obtenerError('descripcion')}
                </small>
              )}
            </div>

            <label className="categorias-casilla">
              <input
                name="activo"
                type="checkbox"
                checked={formulario.activo}
                onChange={manejarCampo}
              />

              Categoría activa
            </label>

            {obtenerError('activo') && (
              <small className="categorias-error-campo">
                {obtenerError('activo')}
              </small>
            )}

            <div className="categorias-formulario-acciones">
              <button
                type="button"
                className="categorias-boton-secundario"
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="categorias-boton-principal"
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : categoriaEditando
                    ? 'Guardar cambios'
                    : 'Registrar categoría'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="categorias-contenedor">
        {cargando ? (
          <div className="categorias-vacio">
            <p>Cargando categorías...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div className="categorias-vacio">
            <h2>No hay categorías registradas</h2>

            <p>
              Registra la primera categoría
              para comenzar a organizar productos.
            </p>
          </div>
        ) : (
          <table className="categorias-tabla">
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

                    <small>
                      {categoria.slug}
                    </small>
                  </td>

                  <td>
                    {categoria.descripcion ||
                      'Sin descripción'}
                  </td>

                  <td>
                    <span
                      className={
                        categoria.activo
                          ? 'categorias-estado-activo'
                          : 'categorias-estado-inactivo'
                      }
                    >
                      {categoria.activo
                        ? 'Activa'
                        : 'Inactiva'}
                    </span>
                  </td>

                  <td>
                    <div className="categorias-botones-tabla">
                      <button
                        type="button"
                        className="categorias-boton-editar"
                        onClick={() => {
                          abrirFormularioEditar(
                            categoria,
                          )
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="categorias-boton-eliminar"
                        onClick={() => {
                          confirmarEliminacion(
                            categoria,
                          )
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

      {categoriaEliminando && (
        <section className="categorias-confirmacion">
          <p className="categorias-marca">
            Confirmar eliminación
          </p>

          <h2>¿Eliminar esta categoría?</h2>

          <p>
            La categoría{' '}

            <strong>
              {categoriaEliminando.nombre}
            </strong>{' '}

            será eliminada del sistema.
          </p>

          {error && (
            <div
              className={
                'categorias-alerta categorias-error'
              }
            >
              {error}
            </div>
          )}

          <div className="categorias-formulario-acciones">
            <button
              type="button"
              className="categorias-boton-secundario"
              onClick={cancelarEliminacion}
              disabled={eliminando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="categorias-boton-confirmar"
              onClick={eliminarCategoria}
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