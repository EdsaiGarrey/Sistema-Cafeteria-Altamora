import { useState } from 'react'
import {
  Alert,
  Button,
  Spinner,
} from 'react-bootstrap'
import {
  useNavigate,
  useSearchParams,
} from 'react-router'
import DisenoAutenticacion from '../../components/autenticacion/DisenoAutenticacion.jsx'
import { useAutenticacion } from '../../contextos/useAutenticacion.js'
import { apiAutenticacion } from '../../servicios/api.js'

export default function CorreoVerificado() {
  const {
    estaAutenticado,
    establecerUsuario,
  } = useAutenticacion()

  const navegar = useNavigate()
  const [parametros] = useSearchParams()

  const [procesando, establecerProcesando] =
    useState(false)

  const [error, establecerError] = useState('')

  const estado = parametros.get('estado') ?? 'error'

  const mensaje =
    parametros.get('mensaje') ??
    'No fue posible determinar el resultado de la verificación.'

  const verificacionCorrecta =
    estado === 'exito'

  async function continuar() {
    if (!estaAutenticado) {
      navegar('/inicio-sesion', {
        replace: true,
      })

      return
    }

    establecerProcesando(true)
    establecerError('')

    try {
      const respuesta =
        await apiAutenticacion.obtenerPerfil()

      establecerUsuario(respuesta.usuario)

      if (
        respuesta.usuario?.correo_verificado_en
      ) {
        navegar('/panel', {
          replace: true,
        })

        return
      }

      navegar('/correo-pendiente', {
        replace: true,
      })
    } catch (errorSolicitud) {
      establecerError(
        errorSolicitud.message ??
          'No fue posible actualizar la sesión.',
      )
    } finally {
      establecerProcesando(false)
    }
  }

  return (
    <DisenoAutenticacion
      titulo={
        verificacionCorrecta
          ? 'Correo verificado'
          : 'No fue posible verificar'
      }
      descripcion="Resultado de la validación de tu cuenta de Café Altamora."
    >
      <Alert
        variant={
          verificacionCorrecta
            ? 'success'
            : 'danger'
        }
      >
        {mensaje}
      </Alert>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <Button
        type="button"
        className="altamora-auth-boton w-100"
        onClick={continuar}
        disabled={procesando}
      >
        {procesando && (
          <Spinner
            size="sm"
            className="me-2"
            aria-hidden="true"
          />
        )}

        {procesando
          ? 'Actualizando cuenta...'
          : estaAutenticado
            ? 'Continuar al sistema'
            : 'Iniciar sesión'}
      </Button>
    </DisenoAutenticacion>
  )
}