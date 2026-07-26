import {
  useEffect,
  useState,
} from 'react'
import { ContextoAutenticacion } from './ContextoAutenticacionBase.js'
import {
  apiAutenticacion,
  eliminarToken,
  guardarToken,
  obtenerToken,
} from '../servicios/api.js'

/**
 * Proporciona los datos y las acciones de autenticación
 * a todos los componentes hijos de la aplicación.
 */
export function ProveedorAutenticacion({ children }) {
  // Usuario que actualmente tiene una sesión activa.
  const [usuario, establecerUsuario] = useState(null)

  /*
   * Indica si React todavía está comprobando si existe
   * una sesión guardada previamente en el navegador.
   */
  const [cargandoSesion, establecerCargandoSesion] =
    useState(true)

  /**
   * Comprueba el token almacenado cuando la aplicación inicia.
   */
  useEffect(() => {
    let componenteActivo = true

    async function cargarSesionGuardada() {
      const token = obtenerToken()

      /*
       * Cuando no existe token, no es necesario consultar
       * el perfil protegido en Laravel.
       */
      if (!token) {
        if (componenteActivo) {
          establecerCargandoSesion(false)
        }

        return
      }

      try {
        // Consultamos el usuario asociado con el token guardado.
        const respuesta =
          await apiAutenticacion.obtenerPerfil()

        if (componenteActivo) {
          establecerUsuario(respuesta.usuario)
        }
      } catch (error) {
        /*
         * Si el token expiró, fue eliminado o ya no es válido,
         * lo retiramos del navegador.
         */
        eliminarToken()

        if (componenteActivo) {
          establecerUsuario(null)
        }

        console.error(
          'No fue posible recuperar la sesión:',
          error,
        )
      } finally {
        if (componenteActivo) {
          establecerCargandoSesion(false)
        }
      }
    }

    cargarSesionGuardada()

    /*
     * Evita actualizar el estado cuando el proveedor
     * ya no se encuentra montado.
     */
    return () => {
      componenteActivo = false
    }
  }, [])

  /**
   * Registra una cuenta nueva y guarda la sesión recibida.
   *
   * @param {object} datos Datos enviados desde el formulario.
   * @returns {Promise<object>}
   */
  async function registrar(datos) {
    const respuesta =
      await apiAutenticacion.registrar(datos)

    guardarToken(respuesta.token)
    establecerUsuario(respuesta.usuario)

    return respuesta
  }

  /**
   * Inicia sesión y guarda el token generado por Sanctum.
   *
   * @param {object} datos Credenciales del usuario.
   * @returns {Promise<object>}
   */
  async function iniciarSesion(datos) {
    const respuesta =
      await apiAutenticacion.iniciarSesion(datos)

    guardarToken(respuesta.token)
    establecerUsuario(respuesta.usuario)

    return respuesta
  }

  /**
   * Cierra la sesión tanto en Laravel como en el navegador.
   */
  async function cerrarSesion() {
    try {
      /*
       * Solicitamos a Laravel que elimine el token actual
       * solamente cuando existe un token almacenado.
       */
      if (obtenerToken()) {
        await apiAutenticacion.cerrarSesion()
      }
    } finally {
      /*
       * La sesión local se elimina incluso si el servidor
       * no responde o el token ya dejó de ser válido.
       */
      eliminarToken()
      establecerUsuario(null)
    }
  }

  /*
   * La sesión se considera activa cuando existe un usuario
   * cargado y también permanece almacenado su token.
   */
  const estaAutenticado = Boolean(
    usuario && obtenerToken(),
  )

  const valorContexto = {
    usuario,
    cargandoSesion,
    estaAutenticado,
    registrar,
    iniciarSesion,
    cerrarSesion,
    establecerUsuario,
  }

  return (
    <ContextoAutenticacion.Provider value={valorContexto}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}

