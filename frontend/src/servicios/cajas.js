import { solicitarApi } from './api.js'

/**
 * Operaciones de la API para la apertura de caja.
 */
export const apiCajas = {
  /**
   * Consulta la caja abierta actualmente.
   */
  activa() {
    return solicitarApi('/cajas/activa', {
      method: 'GET',
    })
  },

  /**
   * Abre una caja con un monto inicial.
   */
  abrir(datos) {
    return solicitarApi('/cajas/abrir', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
}