import {
  Alert,
  Badge,
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap'

/**
 * Solicita confirmación antes de eliminar un producto.
 */
export default function ConfirmarProducto({
  producto,
  error,
  eliminando,
  alConfirmar,
  alCerrar,
}) {
  return (
    <Modal
      show={Boolean(producto)}
      onHide={alCerrar}
      backdrop={eliminando ? 'static' : true}
      centered
    >
      <Modal.Header closeButton={!eliminando}>
        <Modal.Title>
          Eliminar producto
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Se eliminará el producto{' '}
          <strong>{producto?.nombre}</strong>.
        </p>

        <div className="productos-confirmacion-datos">
          <div>
            <small>Categoría</small>

            <strong>
              {producto?.categoria?.nombre ||
                'Sin categoría'}
            </strong>
          </div>

          <div>
            <small>Precio</small>

            <strong>
              ${Number(
                producto?.precio ?? 0,
              ).toFixed(2)}
            </strong>
          </div>

          <Badge
            bg={
              producto?.activo
                ? 'success'
                : 'secondary'
            }
          >
            {producto?.activo
              ? 'Activo'
              : 'Inactivo'}
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