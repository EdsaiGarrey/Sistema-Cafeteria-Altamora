import { solicitarApi } from './api.js'

/**
 * Operaciones relacionadas con la caja.
 */
export const apiCajas = {
  /**
   * Consulta la caja que está abierta.
   */
  activa() {
    return solicitarApi('/cajas/activa', {
      method: 'GET',
    })
  },

  /**
   * Registra la apertura.
   */
  abrir(datos) {
    return solicitarApi('/cajas/abrir', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Realiza el corte y cierre de caja.
   */
  cerrar(datos) {
    return solicitarApi('/cajas/cerrar', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
}