import {
  Alert,
  Badge,
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap'

/**
 * Ventana de confirmación para eliminar usuarios.
 */
export default function ConfirmarEliminacion({
  usuario,
  error,
  eliminando,
  alConfirmar,
  alCerrar,
}) {
  return (
    <Modal
      show={Boolean(usuario)}
      onHide={alCerrar}
      backdrop={eliminando ? 'static' : true}
      centered
    >
      <Modal.Header closeButton={!eliminando}>
        <Modal.Title>
          Confirmar eliminación
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          La cuenta de{' '}
          <strong>{usuario?.nombre}</strong>{' '}
          será eliminada del sistema.
        </p>

        <div className="usuarios-confirmacion-datos">
          <span>
            {usuario?.correo}
          </span>

          <Badge bg="secondary">
            {usuario?.rol}
          </Badge>
        </div>

        <Alert variant="warning" className="mt-3 mb-0">
          Esta acción no se puede deshacer.
        </Alert>

        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="outline-secondary"
          onClick={alCerrar}
          disabled={eliminando}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={alConfirmar}
          disabled={eliminando}
        >
          {eliminando && (
            <Spinner
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
          )}

          {eliminando
            ? 'Eliminando...'
            : 'Sí, eliminar'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}