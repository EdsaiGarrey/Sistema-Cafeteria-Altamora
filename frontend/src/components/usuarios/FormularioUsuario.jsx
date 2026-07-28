import {
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap'

/**
 * Ventana para registrar o editar usuarios.
 */
export default function FormularioUsuario({
  mostrar,
  usuarioEditando,
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
            {usuarioEditando
              ? 'Editar usuario'
              : 'Registrar usuario'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Group controlId="usuario-name">
                <Form.Label>
                  Nombre completo
                </Form.Label>

                <Form.Control
                  name="name"
                  type="text"
                  value={formulario.name}
                  onChange={alCambiar}
                  autoComplete="name"
                  isInvalid={Boolean(
                    obtenerError('name'),
                  )}
                  disabled={guardando}
                />

                <Form.Control.Feedback type="invalid">
                  {obtenerError('name')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group controlId="usuario-email">
                <Form.Label>
                  Correo electrónico
                </Form.Label>

                <Form.Control
                  name="email"
                  type="email"
                  value={formulario.email}
                  onChange={alCambiar}
                  autoComplete="email"
                  isInvalid={Boolean(
                    obtenerError('email'),
                  )}
                  disabled={guardando}
                />

                <Form.Control.Feedback type="invalid">
                  {obtenerError('email')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="usuario-role">
                <Form.Label>Rol</Form.Label>

                <Form.Select
                  name="role"
                  value={formulario.role}
                  onChange={alCambiar}
                  isInvalid={Boolean(
                    obtenerError('role'),
                  )}
                  disabled={guardando}
                >
                  <option value="administrador">
                    Administrador
                  </option>

                  <option value="gerente">
                    Gerente
                  </option>

                  <option value="empleado">
                    Empleado
                  </option>
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  {obtenerError('role')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {usuarioEditando && (
              <Col xs={12}>
                <Alert variant="light" className="mb-0">
                  Deja la contraseña vacía para conservar
                  la contraseña actual.
                </Alert>
              </Col>
            )}

            <Col xs={12} md={6}>
              <Form.Group controlId="usuario-password">
                <Form.Label>
                  {usuarioEditando
                    ? 'Nueva contraseña'
                    : 'Contraseña'}
                </Form.Label>

                <Form.Control
                  name="password"
                  type="password"
                  value={formulario.password}
                  onChange={alCambiar}
                  autoComplete="new-password"
                  isInvalid={Boolean(
                    obtenerError('password'),
                  )}
                  disabled={guardando}
                />

                <Form.Control.Feedback type="invalid">
                  {obtenerError('password')}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group
                controlId="usuario-password-confirmation"
              >
                <Form.Label>
                  Confirmar contraseña
                </Form.Label>

                <Form.Control
                  name="password_confirmation"
                  type="password"
                  value={
                    formulario.password_confirmation
                  }
                  onChange={alCambiar}
                  autoComplete="new-password"
                  disabled={guardando}
                />
              </Form.Group>
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
            className="usuarios-boton-principal"
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
              : usuarioEditando
                ? 'Guardar cambios'
                : 'Registrar usuario'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}