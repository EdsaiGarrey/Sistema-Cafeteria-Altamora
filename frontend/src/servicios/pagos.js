import { solicitarApi } from './api.js'

/**
 * Construye los parámetros utilizados
 * para filtrar los pagos.
 *
 * @param {Record<string, string|number>} filtros
 * @returns {string}
 */
function construirConsulta(filtros) {
  const parametros = new URLSearchParams()

  Object.entries(filtros).forEach(
    ([clave, valor]) => {
      if (
        valor !== '' &&
        valor !== null &&
        valor !== undefined
      ) {
        parametros.set(
          clave,
          String(valor),
        )
      }
    },
  )

  const consulta = parametros.toString()

  return consulta ? `?${consulta}` : ''
}

/**
 * Operaciones disponibles para el módulo de pagos.
 */
export const apiPagos = {
  /**
   * Consulta pagos con filtros y paginación.
   */
  listar(filtros = {}) {
    return solicitarApi(
      `/pagos${construirConsulta(filtros)}`,
      {
        method: 'GET',
      },
    )
  },

  /**
   * Consulta un pago por su identificador.
   */
  obtener(id) {
    return solicitarApi(`/pagos/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Registra un pago relacionado con un pedido.
   */
  crear(datos) {
    return solicitarApi('/pagos', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
}