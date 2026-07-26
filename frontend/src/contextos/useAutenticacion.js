import { useContext } from 'react'
import { ContextoAutenticacion } from './ContextoAutenticacionBase.js'
/**
 * Permite consultar la sesión desde cualquier componente
 * ubicado dentro del proveedor de autenticación.
 *
 * @returns {object}
 */
export function useAutenticacion() {
  const contexto = useContext(ContextoAutenticacion)

  if (contexto === null) {
    throw new Error(
      'useAutenticacion debe utilizarse dentro de ProveedorAutenticacion.',
    )
  }

  return contexto
}