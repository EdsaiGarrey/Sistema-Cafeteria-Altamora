/*
 * Dirección principal de la API de Laravel.
 * Se obtiene desde el archivo .env del frontend.
 */
const URL_BASE_API = (
  import.meta.env.VITE_API_URL ??
  'http://127.0.0.1:8000/api'
).replace(/\/$/, '')

/*
 * Nombre utilizado para guardar el token de Sanctum
 * dentro del almacenamiento local del navegador.
 */
const CLAVE_TOKEN = 'altamora_token'

/**
 * Guarda el token de autenticación en el navegador.
 *
 * @param {string} token Token generado por Laravel Sanctum.
 */
export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token)
}

/**
 * Obtiene el token almacenado.
 *
 * @returns {string|null}
 */
export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN)
}

/**
 * Elimina el token del navegador.
 */
export function eliminarToken() {
  localStorage.removeItem(CLAVE_TOKEN)
}

/**
 * Procesa una respuesta enviada por Laravel.
 *
 * @param {Response} respuesta Respuesta recibida desde la API.
 * @returns {Promise<object|null>}
 */
async function procesarRespuesta(respuesta) {
  /*
   * Algunas respuestas pueden no tener contenido,
   * por ejemplo una respuesta con código HTTP 204.
   */
  if (respuesta.status === 204) {
    return null
  }

  const tipoContenido =
    respuesta.headers.get('content-type') ?? ''

  /*
   * Convertimos la respuesta a JSON solamente cuando
   * Laravel indica que realmente contiene JSON.
   */
  const datos = tipoContenido.includes('application/json')
    ? await respuesta.json()
    : null

  if (!respuesta.ok) {
    /*
     * Creamos un error personalizado para que los formularios
     * puedan consultar el código HTTP y los errores de validación.
     */
    const error = new Error(
      datos?.mensaje ??
      datos?.message ??
      'No fue posible completar la solicitud.',
    )

    error.estado = respuesta.status
    error.datos = datos

    throw error
  }

  return datos
}

/**
 * Realiza una petición general hacia la API de Laravel.
 *
 * @param {string} ruta Ruta relativa de la API.
 * @param {RequestInit} opciones Configuración de la petición.
 * @returns {Promise<object|null>}
 */
export async function solicitarApi(ruta, opciones = {}) {
  const token = obtenerToken()
  const esFormulario = opciones.body instanceof FormData

  /*
   * Todos los endpoints deben responder en formato JSON.
   * Content-Type no se agrega cuando se utiliza FormData,
   * porque el navegador debe generar automáticamente su límite.
   */
  const encabezados = {
    Accept: 'application/json',
    ...(opciones.body !== undefined && !esFormulario
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(opciones.headers ?? {}),
  }

  /*
   * Cuando existe un token, se envía utilizando
   * el esquema Bearer requerido por Laravel Sanctum.
   */
  if (token) {
    encabezados.Authorization = `Bearer ${token}`
  }

  let respuesta

  try {
    respuesta = await fetch(`${URL_BASE_API}${ruta}`, {
      ...opciones,
      headers: encabezados,
    })
  } catch {
    /*
     * Este error ocurre cuando Laravel está apagado,
     * no existe conexión o la dirección de la API es incorrecta.
     */
    const errorConexion = new Error(
      'No fue posible conectar con el servidor. Comprueba que Laravel esté funcionando.',
    )

    errorConexion.estado = 0
    errorConexion.datos = null

    throw errorConexion
  }

  return procesarRespuesta(respuesta)
}

/**
 * Endpoints relacionados con el proceso de autenticación.
 */
export const apiAutenticacion = {
  /**
   * Registra una cuenta nueva.
   */
  registrar(datos) {
    return solicitarApi('/autenticacion/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Inicia sesión con correo electrónico y contraseña.
   */
  iniciarSesion(datos) {
    return solicitarApi('/autenticacion/inicio-sesion', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Obtiene la información del usuario autenticado.
   */
  obtenerPerfil() {
    return solicitarApi('/autenticacion/perfil', {
      method: 'GET',
    })
  },

  /**
   * Cierra la sesión actual en Laravel.
   */
  cerrarSesion() {
    return solicitarApi('/autenticacion/cerrar-sesion', {
      method: 'POST',
    })
  },

  /**
   * Solicita el enlace para recuperar la contraseña.
   */
  recuperarContrasena(datos) {
    return solicitarApi('/autenticacion/recuperar-contrasena', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  /**
   * Envía el token y la nueva contraseña a Laravel.
   */
  restablecerContrasena(datos) {
    return solicitarApi('/autenticacion/restablecer-contrasena', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
}