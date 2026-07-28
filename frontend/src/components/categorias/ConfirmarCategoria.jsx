import {
  Alert,
  Badge,
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap'

/**
 * Solicita confirmación antes de eliminar.
 */
export default function ConfirmarCategoria({
  categoria,
  error,
  eliminando,
  alConfirmar,
  alCerrar,
}) {
  return (
    <Modal
      show={Boolean(categoria)}
      onHide={alCerrar}
      backdrop={eliminando ? 'static' : true}
      centered
    >
      <Modal.Header closeButton={!eliminando}>
        <Modal.Title>
          Eliminar categoría
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Se eliminará la categoría{' '}
          <strong>{categoria?.nombre}</strong>.
        </p>

        <div className="categorias-confirmacion-datos">
          <span>
            {categoria?.descripcion ||
              'Sin descripción'}
          </span>

          <Badge
            bg={
              categoria?.activo
                ? 'success'
                : 'secondary'
            }
          >
            {categoria?.activo
              ? 'Activa'
              : 'Inactiva'}
          </Badge>
        </div>

        <Alert variant="warning" className="mt-3 mb-0">
          No se podrá eliminar si tiene productos
          relacionados.
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