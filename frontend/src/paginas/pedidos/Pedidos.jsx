import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router'
import { apiPedidos } from '../../servicios/pedidos.js'
import './pedidos.css'

const FILTROS_INICIALES = {
  buscar: '',
  estado: '',
  tipo_servicio: '',
}

const FORMULARIO_INICIAL = {
  caja_id: '',
  cliente_nombre: '',
  tipo_servicio: 'local',
  notas: '',
}

const ESTADOS = [
  'pendiente',
  'confirmado',
  'en_preparacion',
  'listo',
  'entregado',
]

/**
 * Convierte un estado técnico en un texto legible.
 */
function mostrarEstado(estado) {
  const estados = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    en_preparacion: 'En preparación',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }

  return estados[estado] ?? estado
}

/**
 * Convierte una fecha de Laravel al formato local.
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
 * Página protegida para administrar pedidos.
 */
export default function Pedidos() {
  const navegar = useNavigate()

  const [pedidos, establecerPedidos] = useState([])
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

  const [formulario, establecerFormulario] = useState(
    FORMULARIO_INICIAL,
  )

  const [
    erroresFormulario,
    establecerErroresFormulario,
  ] = useState({})

  const [guardando, establecerGuardando] = useState(false)

  const [
    pedidoActualizando,
    establecerPedidoActualizando,
  ] = useState(null)

  /**
   * Consulta los pedidos en Laravel.
   */
  const cargarPedidos = useCallback(async (parametros) => {
    establecerCargando(true)
    establecerError('')

    try {
      const respuesta = await apiPedidos.listar({
        ...parametros,
        por_pagina: 10,
      })

      establecerPedidos(respuesta.data ?? [])

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

  useEffect(() => {
    void cargarPedidos({
      ...filtrosAplicados,
      pagina,
      page: pagina,
    })
  }, [
    cargarPedidos,
    filtrosAplicados,
    pagina,
  ])

  /**
   * Actualiza los campos de búsqueda.
   */
  function manejarFiltro(evento) {
    const { name, value } = evento.target

    establecerFiltros((actuales) => ({
      ...actuales,
      [name]: value,
    }))
  }

  /**
   * Envía los filtros al servidor.
   */
  function aplicarFiltros(evento) {
    evento.preventDefault()

    establecerPagina(1)
    establecerFiltrosAplicados({
      ...filtros,
    })
  }

  /**
   * Limpia todos los filtros.
   */
  function limpiarFiltros() {
    establecerFiltros(FILTROS_INICIALES)
    establecerFiltrosAplicados(FILTROS_INICIALES)
    establecerPagina(1)
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

    establecerErroresFormulario((actuales) => ({
      ...actuales,
      [name]: undefined,
    }))
  }

  /**
   * Registra un pedido nuevo.
   */
  async function crearPedido(evento) {
    evento.preventDefault()

    establecerGuardando(true)
    establecerErroresFormulario({})
    establecerError('')
    establecerMensaje('')

    try {
      const respuesta = await apiPedidos.crear({
        ...formulario,
        caja_id: Number(formulario.caja_id),
      })

      establecerMensaje(respuesta.mensaje)
      establecerFormulario(FORMULARIO_INICIAL)
      establecerMostrandoFormulario(false)
      establecerPagina(1)

      await cargarPedidos({
        ...filtrosAplicados,
        page: 1,
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
   * Cambia el estado operativo de un pedido.
   */
  async function cambiarEstado(id, estado) {
    establecerPedidoActualizando(id)
    establecerError('')
    establecerMensaje('')

    try {
      const respuesta = await apiPedidos.actualizar(
        id,
        {
          estado,
        },
      )

      establecerPedidos((actuales) =>
        actuales.map((pedido) =>
          pedido.id === id
            ? respuesta.pedido
            : pedido
        ),
      )

      establecerMensaje(respuesta.mensaje)
    } catch (errorPeticion) {
      establecerError(errorPeticion.message)
    } finally {
      establecerPedidoActualizando(null)
    }
  }

  return (
    <main className="pedidos-pagina">
      <header className="pedidos-encabezado">
        <div>
          <span className="pedidos-marca">
            Altamora Café
          </span>

          <h1>Gestión de pedidos</h1>

          <p>
            Consulta, registra y actualiza los pedidos
            de la cafetería.
          </p>
        </div>

        <div className="pedidos-acciones-encabezado">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => navegar('/panel')}
          >
            Volver al panel
          </button>

          <button
            type="button"
            className="boton-principal"
            onClick={() =>
              establecerMostrandoFormulario(true)
            }
          >
            Nuevo pedido
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="mensaje-exito">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mensaje-error-general">
          {error}
        </div>
      )}

      <section className="pedidos-tarjeta">
        <form
          className="pedidos-filtros"
          onSubmit={aplicarFiltros}
        >
          <label>
            Buscar
            <input
              type="search"
              name="buscar"
              value={filtros.buscar}
              onChange={manejarFiltro}
              placeholder="Folio o cliente"
            />
          </label>

          <label>
            Estado
            <select
              name="estado"
              value={filtros.estado}
              onChange={manejarFiltro}
            >
              <option value="">Todos</option>

              {ESTADOS.map((estado) => (
                <option
                  key={estado}
                  value={estado}
                >
                  {mostrarEstado(estado)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de servicio
            <select
              name="tipo_servicio"
              value={filtros.tipo_servicio}
              onChange={manejarFiltro}
            >
              <option value="">Todos</option>
              <option value="local">Local</option>
              <option value="llevar">Para llevar</option>
              <option value="domicilio">
                Domicilio
              </option>
            </select>
          </label>

          <div className="pedidos-botones-filtro">
            <button
              type="submit"
              className="boton-principal"
            >
              Aplicar
            </button>

            <button
              type="button"
              className="boton-secundario"
              onClick={limpiarFiltros}
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="pedidos-tarjeta">
        <div className="pedidos-resumen">
          <h2>Pedidos registrados</h2>

          <span>
            {meta.total ?? 0} resultados
          </span>
        </div>

        {cargando ? (
          <div className="pedidos-estado">
            Cargando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="pedidos-estado">
            No se encontraron pedidos.
          </div>
        ) : (
          <div className="pedidos-tabla-contenedor">
            <table className="pedidos-tabla">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Caja</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>
                      <strong>{pedido.folio}</strong>
                    </td>

                    <td>
                      {pedido.cliente_nombre ??
                        'Venta general'}
                    </td>

                    <td>
                      {pedido.tipo_servicio}
                    </td>

                    <td>
                      #{pedido.caja?.id ?? '—'}
                    </td>

                    <td>
                      {mostrarFecha(pedido.pedido_en)}
                    </td>

                    <td>
                      ${Number(
                        pedido.total ?? 0,
                      ).toFixed(2)}
                    </td>

                    <td>
                      <select
                        className={`estado-pedido estado-${pedido.estado}`}
                        value={pedido.estado}
                        disabled={
                          pedidoActualizando ===
                          pedido.id
                        }
                        onChange={(evento) =>
                          cambiarEstado(
                            pedido.id,
                            evento.target.value,
                          )
                        }
                      >
                        {ESTADOS.map((estado) => (
                          <option
                            key={estado}
                            value={estado}
                          >
                            {mostrarEstado(estado)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pedidos-paginacion">
          <button
            type="button"
            className="boton-secundario"
            disabled={
              pagina <= 1 ||
              cargando
            }
            onClick={() =>
              establecerPagina((actual) =>
                Math.max(1, actual - 1)
              )
            }
          >
            Anterior
          </button>

          <span>
            Página {meta.current_page ?? pagina} de{' '}
            {meta.last_page ?? 1}
          </span>

          <button
            type="button"
            className="boton-secundario"
            disabled={
              pagina >=
                (meta.last_page ?? 1) ||
              cargando
            }
            onClick={() =>
              establecerPagina((actual) =>
                actual + 1
              )
            }
          >
            Siguiente
          </button>
        </div>
      </section>

      {mostrandoFormulario && (
        <div
          className="modal-fondo"
          role="presentation"
          onMouseDown={() =>
            establecerMostrandoFormulario(false)
          }
        >
          <section
            className="modal-pedido"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-nuevo-pedido"
            onMouseDown={(evento) =>
              evento.stopPropagation()
            }
          >
            <div className="modal-encabezado">
              <div>
                <span>Altamora Café</span>

                <h2 id="titulo-nuevo-pedido">
                  Nuevo pedido
                </h2>
              </div>

              <button
                type="button"
                className="modal-cerrar"
                aria-label="Cerrar formulario"
                onClick={() =>
                  establecerMostrandoFormulario(
                    false,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              className="formulario-pedido"
              onSubmit={crearPedido}
            >
              <label>
                Número de caja
                <input
                  type="number"
                  min="1"
                  name="caja_id"
                  value={formulario.caja_id}
                  onChange={manejarFormulario}
                  required
                />

                {erroresFormulario.caja_id?.[0] && (
                  <small className="error-campo">
                    {
                      erroresFormulario
                        .caja_id[0]
                    }
                  </small>
                )}
              </label>

              <label>
                Nombre del cliente
                <input
                  type="text"
                  name="cliente_nombre"
                  maxLength="120"
                  value={
                    formulario.cliente_nombre
                  }
                  onChange={manejarFormulario}
                  placeholder="Opcional"
                />

                {erroresFormulario
                  .cliente_nombre?.[0] && (
                  <small className="error-campo">
                    {
                      erroresFormulario
                        .cliente_nombre[0]
                    }
                  </small>
                )}
              </label>

              <label>
                Tipo de servicio
                <select
                  name="tipo_servicio"
                  value={
                    formulario.tipo_servicio
                  }
                  onChange={manejarFormulario}
                  required
                >
                  <option value="local">
                    Consumo local
                  </option>

                  <option value="llevar">
                    Para llevar
                  </option>

                  <option value="domicilio">
                    Entrega a domicilio
                  </option>
                </select>

                {erroresFormulario
                  .tipo_servicio?.[0] && (
                  <small className="error-campo">
                    {
                      erroresFormulario
                        .tipo_servicio[0]
                    }
                  </small>
                )}
              </label>

              <label>
                Notas
                <textarea
                  name="notas"
                  maxLength="1000"
                  value={formulario.notas}
                  onChange={manejarFormulario}
                  placeholder="Indicaciones especiales"
                />

                {erroresFormulario.notas?.[0] && (
                  <small className="error-campo">
                    {
                      erroresFormulario
                        .notas[0]
                    }
                  </small>
                )}
              </label>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() =>
                    establecerMostrandoFormulario(
                      false,
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="boton-principal"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando...'
                    : 'Registrar pedido'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}