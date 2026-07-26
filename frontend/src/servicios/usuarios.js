import { solicitarApi } from './api.js'

/**
 * Construye los parámetros utilizados para
 * buscar, filtrar y paginar usuarios.
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
 * Operaciones disponibles para el módulo
 * administrativo de usuarios.
 */
export const apiUsuarios = {
  /**
   * Consulta usuarios con filtros y paginación.
   */
  listar(filtros = {}) {
    return solicitarApi(
      `/usuarios${construirConsulta(filtros)}`,
      {
        method: 'GET',
      },
    )
  },

  /**
   * Consulta un usuario específico.
   */
  obtener(id) {
    return solicitarApi(`/usuarios/${id}`, {
      method: 'GET',
    })
  },

  /**
   * Registra un usuario nuevo.
   */
  crear(datos) {
    return solicitarApi('/usuarios', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Actualiza un usuario existente.
   */
  actualizar(id, datos) {
    return solicitarApi(`/usuarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Elimina un usuario.
   */
  eliminar(id) {
    return solicitarApi(`/usuarios/${id}`, {
      method: 'DELETE',
    })
  },
}