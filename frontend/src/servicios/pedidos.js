import { solicitarApi } from './api.js'

/**
 * Construye los parámetros enviados al listado de pedidos.
 *
 * @param {Record<string, string|number>} filtros
 * @returns {string}
 */
function construirConsulta(filtros) {
  const parametros = new URLSearchParams()

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (
      valor !== '' &&
      valor !== null &&
      valor !== undefined
    ) {
      parametros.set(clave, String(valor))
    }
  })

  const consulta = parametros.toString()

  return consulta ? `?${consulta}` : ''
}

/**
 * Operaciones disponibles para el módulo de pedidos.
 */
export const apiPedidos = {
  /**
   * Consulta pedidos utilizando filtros y paginación.
   */
  listar(filtros = {}) {
    return solicitarApi(
      `/pedidos${construirConsulta(filtros)}`,
      {
        method: 'GET',
      },
    )
  },

  /**
   * Consulta un pedido por su identificador.
   */
  obtener(id) {
    return solicitarApi(`/pedidos/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Registra un pedido.
   */
  crear(datos) {
    return solicitarApi('/pedidos', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Actualiza un pedido.
   */
  actualizar(id, datos) {
    return solicitarApi(`/pedidos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    })
  },
}