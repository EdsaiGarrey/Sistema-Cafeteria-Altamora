import {
  Alert,
  Button,
  Form,
  Modal,
  Spinner,
} from 'react-bootstrap'

/**
 * Ventana para registrar o editar una categoría.
 */
export default function FormularioCategoria({
  mostrar,
  categoriaEditando,
  formulario,
  errores,
  error,
  guardando,
  alCambiar,
  alGuardar,
  alCerrar,
}) {
  function obtenerError(campo) {
    return errores[campo]?.[0] ?? ''
  }

  return (
    <Modal
      show={mostrar}
      onHide={alCerrar}
      backdrop={guardando ? 'static' : true}
      centered
    >
      <Form onSubmit={alGuardar} noValidate>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title>
            {categoriaEditando
              ? 'Editar categoría'
              : 'Registrar categoría'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Form.Group
            controlId="categoria-nombre"
            className="mb-3"
          >
            <Form.Label>Nombre</Form.Label>

            <Form.Control
              name="nombre"
              type="text"
              value={formulario.nombre}
              onChange={alCambiar}
              placeholder="Ejemplo: Bebidas calientes"
              isInvalid={Boolean(
                obtenerError('nombre'),
              )}
              disabled={guardando}
            />

            <Form.Control.Feedback type="invalid">
              {obtenerError('nombre')}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group
            controlId="categoria-descripcion"
            className="mb-3"
          >
            <Form.Label>Descripción</Form.Label>

            <Form.Control
              as="textarea"
              name="descripcion"
              rows={4}
              value={formulario.descripcion}
              onChange={alCambiar}
              placeholder="Describe brevemente la categoría"
              isInvalid={Boolean(
                obtenerError('descripcion'),
              )}
              disabled={guardando}
            />

            <Form.Control.Feedback type="invalid">
              {obtenerError('descripcion')}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Check
            id="categoria-activo"
            name="activo"
            type="switch"
            label="Categoría activa"
            checked={formulario.activo}
            onChange={alCambiar}
            isInvalid={Boolean(
              obtenerError('activo'),
            )}
            disabled={guardando}
          />

          {obtenerError('activo') && (
            <small className="text-danger">
              {obtenerError('activo')}
            </small>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={alCerrar}
            disabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="categorias-boton-principal"
            disabled={guardando}
          >
            {guardando && (
              <Spinner
                size="sm"
                className="me-2"
                aria-hidden="true"
              />
            )}

            {guardando
              ? 'Guardando...'
              : categoriaEditando
                ? 'Guardar cambios'
                : 'Registrar categoría'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}