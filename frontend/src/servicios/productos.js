import { solicitarApi } from './api.js'

/**
 * Operaciones de la API para productos.
 */
export const apiProductos = {
  /**
   * Consulta la lista de productos.
   */
  listar() {
    return solicitarApi('/productos', {
      method: 'GET',
    })
  },

  /**
   * Registra un producto.
   */
  crear(datos) {
    return solicitarApi('/productos', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Actualiza un producto.
   */
  actualizar(id, datos) {
    return solicitarApi(`/productos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Elimina un producto.
   */
  eliminar(id) {
    return solicitarApi(`/productos/${id}`, {
      method: 'DELETE',
    })
  },
}