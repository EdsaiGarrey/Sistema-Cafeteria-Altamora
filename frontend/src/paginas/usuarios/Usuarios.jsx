import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
import { apiUsuarios } from '../../servicios/usuarios.js'
import './usuarios.css'

const FILTROS_INICIALES = {
  buscar: '',
  role: '',
}

const FORMULARIO_INICIAL = {
  nombre: '',
  correo: '',
  rol: 'empleado',
  contrasena: '',
  confirmarContrasena: '',
}

/**
 * Convierte el rol técnico en un texto legible.
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
 * Convierte una fecha de Laravel
 * al formato utilizado en México.
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
 * Página administrativa para consultar,
 * registrar, editar y eliminar usuarios.
 */
export default function Usuarios() {
  const navegar = useNavigate()

  const [usuarios, establecerUsuarios] = useState([])

  const [meta, establecerMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  const [filtros, establecerFiltros] = useState(
    FILTROS_INICIALES,
  )

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

  const [formulario, establecerFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const [
    erroresFormulario,
    establecerErroresFormulario,
  ] = useState({})

  const [guardando, establecerGuardando] = useState(false)

  const [
    usuarioEliminando,
    establecerUsuarioEliminando,
  ] = useState(null)

  const [eliminando, establecerEliminando] =
    useState(false)

  /**
   * Consulta los usuarios almacenados en Laravel.
   */
  const cargarUsuarios = useCallback(async (parametros) => {
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
  }, [])

  /**
   * Recarga los usuarios cuando cambian
   * la página o los filtros aplicados.
   */
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

  /**
   * Actualiza los campos de los filtros.
   */
  function manejarFiltro(evento) {
    const { name, value } = evento.target

    establecerFiltros((actuales) => ({
      ...actuales,
      [name]: value,
    }))
  }

  /**
   * Aplica la búsqueda y el filtro por rol.
   */
  function aplicarFiltros(evento) {
    evento.preventDefault()

    establecerPagina(1)

    establecerFiltrosAplicados({
      ...filtros,
    })
  }

  /**
   * Restablece todos los filtros.
   */
  function limpiarFiltros() {
    establecerFiltros(FILTROS_INICIALES)
    establecerFiltrosAplicados(FILTROS_INICIALES)
    establecerPagina(1)
  }

  /**
   * Abre el formulario para registrar un usuario.
   */
  function abrirFormularioCreacion() {
    establecerUsuarioEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')
    establecerMostrandoFormulario(true)
  }

  /**
   * Abre el formulario con los datos
   * del usuario seleccionado.
   */
  function abrirFormularioEdicion(usuario) {
    establecerUsuarioEditando(usuario)

    establecerFormulario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      contrasena: '',
      confirmarContrasena: '',
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
    establecerUsuarioEditando(null)
    establecerFormulario(FORMULARIO_INICIAL)
    establecerErroresFormulario({})
    establecerError('')
  }

  /**
   * Actualiza los campos del formulario.
   */
  function manejarFormulario(evento) {
    const { name, value } = evento.target

    establecerFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))

    const equivalencias = {
      nombre: 'name',
      correo: 'email',
      rol: 'role',
      contrasena: 'password',
      confirmarContrasena: 'password',
    }

    const campoLaravel = equivalencias[name]

    establecerErroresFormulario((actuales) => ({
      ...actuales,
      [campoLaravel]: undefined,
    }))
  }

  /**
   * Obtiene el primer error de validación
   * recibido para un campo.
   */
  function obtenerErrorCampo(campo) {
    return erroresFormulario[campo]?.[0] ?? ''
  }

  /**
   * Registra o actualiza un usuario.
   */
  async function guardarUsuario(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')

    const datos = {
      name: formulario.nombre.trim(),
      email: formulario.correo.trim(),
      role: formulario.rol,
    }

    /*
     * La contraseña es obligatoria al registrar.
     * Durante la edición solamente se envía cuando
     * el administrador escribe una nueva.
     */
    if (
      !usuarioEditando ||
      formulario.contrasena !== ''
    ) {
      datos.password = formulario.contrasena

      datos.password_confirmation =
        formulario.confirmarContrasena
    }

    try {
      const respuesta = usuarioEditando
        ? await apiUsuarios.actualizar(
            usuarioEditando.id,
            datos,
          )
        : await apiUsuarios.crear(datos)

      establecerMensaje(respuesta.mensaje)
      establecerMostrandoFormulario(false)
      establecerUsuarioEditando(null)
      establecerFormulario(FORMULARIO_INICIAL)

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

  /**
   * Abre la confirmación para eliminar
   * al usuario seleccionado.
   */
  function abrirConfirmacionEliminar(usuario) {
    establecerUsuarioEliminando(usuario)
    establecerError('')
    establecerMensaje('')
  }

  /**
   * Cierra la confirmación de eliminación.
   */
  function cerrarConfirmacionEliminar() {
    if (eliminando) {
      return
    }

    establecerUsuarioEliminando(null)
    establecerError('')
  }

  /**
   * Elimina el usuario después
   * de confirmar la operación.
   */
  async function eliminarUsuario() {
    if (!usuarioEliminando) {
      return
    }

    const usuarioId = usuarioEliminando.id

    establecerEliminando(true)
    establecerError('')
    establecerMensaje('')

    try {
      const respuesta = await apiUsuarios.eliminar(
        usuarioId,
      )

      establecerMensaje(respuesta.mensaje)
      establecerUsuarioEliminando(null)

      /*
       * Si se elimina el único usuario de una página,
       * se regresa a la página anterior.
       */
      const paginaDestino =
        usuarios.length === 1 && pagina > 1
          ? pagina - 1
          : pagina

      establecerPagina(paginaDestino)

      /*
       * Cuando la página no cambia, actualizamos
       * manualmente el listado.
       */
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
    <main className="usuarios-pagina">
      <header className="usuarios-encabezado">
        <div>
          <p className="usuarios-marca">
            Altamora Café
          </p>

          <h1>Administración de usuarios</h1>

          <p>
            Consulta y administra las cuentas y roles
            registrados dentro del sistema.
          </p>
        </div>

        <div className="usuarios-encabezado-acciones">
          <button
            type="button"
            className="usuarios-boton-principal"
            onClick={abrirFormularioCreacion}
          >
            Nuevo usuario
          </button>

          <button
            type="button"
            className="usuarios-boton-secundario"
            onClick={() => navegar('/panel')}
          >
            Regresar al panel
          </button>
        </div>
      </header>

      <section className="usuarios-resumen">
        <div>
          <span>Usuarios registrados</span>

          <strong>{meta.total}</strong>
        </div>

        <div>
          <span>Página actual</span>

          <strong>
            {meta.current_page} de {meta.last_page}
          </strong>
        </div>
      </section>

      <form
        className="usuarios-filtros"
        onSubmit={aplicarFiltros}
      >
        <div className="usuarios-campo">
          <label htmlFor="buscar">
            Nombre o correo
          </label>

          <input
            id="buscar"
            name="buscar"
            type="search"
            value={filtros.buscar}
            onChange={manejarFiltro}
            placeholder="Buscar usuario..."
          />
        </div>

        <div className="usuarios-campo">
          <label htmlFor="role">
            Rol
          </label>

          <select
            id="role"
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
          </select>
        </div>

        <div className="usuarios-filtros-acciones">
          <button
            type="submit"
            className="usuarios-boton-principal"
          >
            Aplicar filtros
          </button>

          <button
            type="button"
            className="usuarios-boton-secundario"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        </div>
      </form>

      {mensaje && (
        <div
          className="usuarios-alerta usuarios-alerta-exito"
          role="status"
        >
          {mensaje}
        </div>
      )}

      {error && !usuarioEliminando && (
        <div
          className="usuarios-alerta usuarios-alerta-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="usuarios-tabla-contenedor">
        {cargando ? (
          <div className="usuarios-estado">
            <div className="usuarios-cargador" />

            <p>Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="usuarios-estado">
            <h2>No se encontraron usuarios</h2>

            <p>
              Modifica los filtros para realizar
              una búsqueda diferente.
            </p>
          </div>
        ) : (
          <table className="usuarios-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.nombre}</strong>

                    <small>ID: {usuario.id}</small>
                  </td>

                  <td>{usuario.correo}</td>

                  <td>
                    <span
                      className={
                        `usuarios-rol usuarios-rol-${usuario.rol}`
                      }
                    >
                      {mostrarRol(usuario.rol)}
                    </span>
                  </td>

                  <td>
                    {mostrarFecha(usuario.creado_en)}
                  </td>

                  <td>
                    <div className="usuarios-acciones-tabla">
                      <button
                        type="button"
                        className="usuarios-boton-editar"
                        onClick={() => {
                          abrirFormularioEdicion(usuario)
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="usuarios-boton-eliminar"
                        onClick={() => {
                          abrirConfirmacionEliminar(usuario)
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

      <nav
        className="usuarios-paginacion"
        aria-label="Paginación de usuarios"
      >
        <button
          type="button"
          disabled={
            cargando ||
            meta.current_page <= 1
          }
          onClick={() => {
            establecerPagina((actual) =>
              Math.max(1, actual - 1),
            )
          }}
        >
          Anterior
        </button>

        <span>
          Página {meta.current_page} de {meta.last_page}
        </span>

        <button
          type="button"
          disabled={
            cargando ||
            meta.current_page >= meta.last_page
          }
          onClick={() => {
            establecerPagina((actual) =>
              Math.min(
                meta.last_page,
                actual + 1,
              ),
            )
          }}
        >
          Siguiente
        </button>
      </nav>

      {mostrandoFormulario && (
        <div
          className="usuarios-modal-fondo"
          role="presentation"
        >
          <section
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-usuario"
          >
            <header className="usuarios-modal-encabezado">
              <div>
                <p className="usuarios-marca">
                  Gestión de cuentas
                </p>

                <h2 id="titulo-formulario-usuario">
                  {usuarioEditando
                    ? 'Editar usuario'
                    : 'Registrar usuario'}
                </h2>
              </div>

              <button
                type="button"
                className="usuarios-modal-cerrar"
                onClick={cerrarFormulario}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </header>

            <form
              className="usuarios-formulario"
              onSubmit={guardarUsuario}
            >
              {error && (
                <div
                  className="usuarios-alerta usuarios-alerta-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="usuarios-campo">
                <label htmlFor="nombre">
                  Nombre completo
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formulario.nombre}
                  onChange={manejarFormulario}
                  autoComplete="name"
                />

                {obtenerErrorCampo('name') && (
                  <small className="usuarios-error-campo">
                    {obtenerErrorCampo('name')}
                  </small>
                )}
              </div>

              <div className="usuarios-campo">
                <label htmlFor="correo">
                  Correo electrónico
                </label>

                <input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formulario.correo}
                  onChange={manejarFormulario}
                  autoComplete="email"
                />

                {obtenerErrorCampo('email') && (
                  <small className="usuarios-error-campo">
                    {obtenerErrorCampo('email')}
                  </small>
                )}
              </div>

              <div className="usuarios-campo">
                <label htmlFor="rol">
                  Rol
                </label>

                <select
                  id="rol"
                  name="rol"
                  value={formulario.rol}
                  onChange={manejarFormulario}
                >
                  <option value="administrador">
                    Administrador
                  </option>

                  <option value="gerente">
                    Gerente
                  </option>

                  <option value="empleado">
                    Empleado
                  </option>
                </select>

                {obtenerErrorCampo('role') && (
                  <small className="usuarios-error-campo">
                    {obtenerErrorCampo('role')}
                  </small>
                )}
              </div>

              {usuarioEditando && (
                <p className="usuarios-formulario-ayuda">
                  Deja la contraseña vacía para conservar
                  la contraseña actual.
                </p>
              )}

              <div className="usuarios-formulario-columnas">
                <div className="usuarios-campo">
                  <label htmlFor="contrasena">
                    {usuarioEditando
                      ? 'Nueva contraseña'
                      : 'Contraseña'}
                  </label>

                  <input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    value={formulario.contrasena}
                    onChange={manejarFormulario}
                    autoComplete="new-password"
                  />
                </div>

                <div className="usuarios-campo">
                  <label htmlFor="confirmarContrasena">
                    Confirmar contraseña
                  </label>

                  <input
                    id="confirmarContrasena"
                    name="confirmarContrasena"
                    type="password"
                    value={formulario.confirmarContrasena}
                    onChange={manejarFormulario}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {obtenerErrorCampo('password') && (
                <small className="usuarios-error-campo">
                  {obtenerErrorCampo('password')}
                </small>
              )}

              <footer className="usuarios-modal-acciones">
                <button
                  type="button"
                  className="usuarios-boton-secundario"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="usuarios-boton-principal"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando...'
                    : usuarioEditando
                      ? 'Guardar cambios'
                      : 'Registrar usuario'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {usuarioEliminando && (
        <div
          className="usuarios-modal-fondo"
          role="presentation"
        >
          <section
            className="usuarios-confirmacion"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar-usuario"
            aria-describedby="descripcion-eliminar-usuario"
          >
            <span
              className="usuarios-confirmacion-icono"
              aria-hidden="true"
            >
              !
            </span>

            <p className="usuarios-marca">
              Confirmar eliminación
            </p>

            <h2 id="titulo-eliminar-usuario">
              ¿Eliminar este usuario?
            </h2>

            <p id="descripcion-eliminar-usuario">
              La cuenta de{' '}

              <strong>
                {usuarioEliminando.nombre}
              </strong>{' '}

              será eliminada definitivamente del sistema.
            </p>

            <div className="usuarios-confirmacion-datos">
              <span>Correo electrónico</span>

              <strong>
                {usuarioEliminando.correo}
              </strong>

              <span>Rol actual</span>

              <strong>
                {mostrarRol(usuarioEliminando.rol)}
              </strong>
            </div>

            <p className="usuarios-confirmacion-advertencia">
              Esta acción no se puede deshacer.
            </p>

            {error && (
              <div
                className="usuarios-alerta usuarios-alerta-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <footer className="usuarios-modal-acciones">
              <button
                type="button"
                className="usuarios-boton-secundario"
                onClick={cerrarConfirmacionEliminar}
                disabled={eliminando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="usuarios-boton-confirmar-eliminar"
                onClick={eliminarUsuario}
                disabled={eliminando}
              >
                {eliminando
                  ? 'Eliminando...'
                  : 'Sí, eliminar usuario'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}