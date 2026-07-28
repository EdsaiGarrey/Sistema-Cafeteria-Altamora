import {
  Alert,
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap'

/**
 * Ventana para registrar o editar productos.
 */
export default function FormularioProducto({
  mostrar,
  productoEditando,
  categorias,
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
      size="lg"
    >
      <Form onSubmit={alGuardar} noValidate>
        <Modal.Header closeButton={!guardando}>
          <Modal.Title>
            {productoEditando
              ? 'Editar producto'
              : 'Registrar producto'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          {categorias.length === 0 && (
            <Alert variant="warning">
              Primero debes registrar una categoría.
            </Alert>
          )}

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="producto-categoria">
                <Form.Label>
                  Categoría
                </Form.Label>

                <Form.Select
                  name="categoria_id"
                  value={formulario.categoria_id}
                  onChange={alCambiar}
                  isInvalid={Boolean(
                    obtenerError('categoria_id'),
                  )}
                  disabled={guardando}
                >
                  <option value="">
                    Selecciona una categoría
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      key={categoria.id}
                      value={categoria.id}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {obtenerError('categoria_id')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="producto-nombre">
                <Form.Label>
                  Nombre
                </Form.Label>

                <Form.Control
                  name="nombre"
                  type="text"
                  value={formulario.nombre}
                  onChange={alCambiar}
                  placeholder="Ejemplo: Capuchino"
                  isInvalid={Boolean(
                    obtenerError('nombre'),
                  )}
                  disabled={guardando}
                />

                <Form.Control.Feedback type="invalid">
                  {obtenerError('nombre')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="producto-descripcion">
                <Form.Label>
                  Descripción
                </Form.Label>

                <Form.Control
                  as="textarea"
                  name="descripcion"
                  rows={3}
                  value={formulario.descripcion}
                  onChange={alCambiar}
                  placeholder="Describe brevemente el producto"
                  isInvalid={Boolean(
                    obtenerError('descripcion'),
                  )}
                  disabled={guardando}
                />

                <Form.Control.Feedback type="invalid">
                  {obtenerError('descripcion')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={5}>
              <Form.Group controlId="producto-precio">
                <Form.Label>
                  Precio
                </Form.Label>

                <InputGroup>
                  <InputGroup.Text>
                    $
                  </InputGroup.Text>

                  <Form.Control
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formulario.precio}
                    onChange={alCambiar}
                    placeholder="65.00"
                    isInvalid={Boolean(
                      obtenerError('precio'),
                    )}
                    disabled={guardando}
                  />

                  <Form.Control.Feedback type="invalid">
                    {obtenerError('precio')}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col xs={12} md={7}>
              <Form.Group controlId="producto-imagen">
                <Form.Label>
                  URL de imagen
                </Form.Label>

                <Form.Control
                  name="imagen"
                  type="url"
                  value={formulario.imagen}
                  onChange={alCambiar}
                  placeholder="https://..."
                  isInvalid={Boolean(
                    obtenerError('imagen'),
                  )}
                  disabled={guardando}
                />

                <Form.Control.Feedback type="invalid">
                  {obtenerError('imagen')}
                </Form.Control.Feedback>

                <Form.Text className="text-muted">
                  Este campo es opcional.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Check
                id="producto-activo"
                name="activo"
                type="switch"
                label="Producto activo"
                checked={formulario.activo}
                onChange={alCambiar}
                disabled={guardando}
              />

              {obtenerError('activo') && (
                <small className="text-danger">
                  {obtenerError('activo')}
                </small>
              )}
            </Col>
          </Row>
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
            className="productos-boton-principal"
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
              : productoEditando
                ? 'Guardar cambios'
                : 'Registrar producto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}