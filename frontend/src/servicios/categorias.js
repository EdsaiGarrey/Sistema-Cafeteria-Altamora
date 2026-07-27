import { solicitarApi } from './api.js'

/**
 * Operaciones de la API para categorías.
 */
export const apiCategorias = {
  /**
   * Consulta todas las categorías.
   */
  listar() {
    return solicitarApi('/categorias', {
      method: 'GET',
    })
  },

  /**
   * Registra una categoría.
   */
  crear(datos) {
    return solicitarApi('/categorias', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Actualiza una categoría.
   */
  actualizar(id, datos) {
    return solicitarApi(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Elimina una categoría.
   */
  eliminar(id) {
    return solicitarApi(`/categorias/${id}`, {
      method: 'DELETE',
    })
  },
}