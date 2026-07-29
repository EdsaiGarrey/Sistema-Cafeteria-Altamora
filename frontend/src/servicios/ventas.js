import { solicitarApi } from './api.js'

/**
 * Construye los parámetros para consultar ventas.
 */
function construirConsulta(filtros = {}) {
  const parametros = new URLSearchParams()

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null) {
      parametros.set(clave, valor)
    }
  })

  const consulta = parametros.toString()

  return consulta ? `?${consulta}` : ''
}

/**
 * Operaciones del historial de ventas.
 */
export const apiVentas = {
  listar(filtros = {}) {
    return solicitarApi(
      `/historial-ventas${construirConsulta(filtros)}`,
      {
        method: 'GET',
      },
    )
  },

  obtener(id) {
    return solicitarApi(
      `/historial-ventas/${id}`,
      {
        method: 'GET',
      },
    )
  },

  cancelar(id, motivo) {
    return solicitarApi(
      `/pedidos/${id}/cancelar`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          motivo_cancelacion: motivo,
        }),
      },
    )
  },
}