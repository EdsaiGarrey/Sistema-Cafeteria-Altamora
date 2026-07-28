import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap'

/**
 * Permite seleccionar los productos
 * y cantidades de un pedido.
 */
export default function SelectorProductosPedido({
  productosDisponibles,
  productosSeleccionados,
  errores,
  cargando,
  alCambiar,
  alAgregar,
  alEliminar,
}) {
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label className="mb-0 fw-semibold">
          Productos del pedido
        </Form.Label>

        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={alAgregar}
        >
          Agregar producto
        </Button>
      </div>

      {errores.productos?.[0] && (
        <div className="text-danger small mb-2">
          {errores.productos[0]}
        </div>
      )}

      {productosSeleccionados.map((item, indice) => {
        const errorProducto =
          errores[
            `productos.${indice}.producto_id`
          ]?.[0]

        const errorCantidad =
          errores[
            `productos.${indice}.cantidad`
          ]?.[0]

        return (
          <div
            key={indice}
            className="border rounded p-3 mb-2 bg-light"
          >
            <Row className="g-2 align-items-end">
              <Col md={7}>
                <Form.Group>
                  <Form.Label>
                    Producto
                  </Form.Label>

                  <Form.Select
                    value={item.producto_id}
                    disabled={cargando}
                    onChange={(evento) =>
                      alCambiar(
                        indice,
                        'producto_id',
                        evento.target.value,
                      )
                    }
                    isInvalid={Boolean(errorProducto)}
                  >
                    <option value="">
                      {cargando
                        ? 'Cargando productos...'
                        : 'Selecciona un producto'}
                    </option>

                    {productosDisponibles.map(
                      (producto) => (
                        <option
                          key={producto.id}
                          value={producto.id}
                        >
                          {producto.nombre} — $
                          {Number(
                            producto.precio,
                          ).toFixed(2)}
                        </option>
                      ),
                    )}
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    {errorProducto}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>
                    Cantidad
                  </Form.Label>

                  <Form.Control
                    type="number"
                    min="1"
                    max="100"
                    value={item.cantidad}
                    onChange={(evento) =>
                      alCambiar(
                        indice,
                        'cantidad',
                        evento.target.value,
                      )
                    }
                    isInvalid={Boolean(errorCantidad)}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errorCantidad}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Button
                  type="button"
                  variant="outline-danger"
                  className="w-100"
                  disabled={
                    productosSeleccionados.length === 1
                  }
                  onClick={() =>
                    alEliminar(indice)
                  }
                >
                  Quitar
                </Button>
              </Col>
            </Row>
          </div>
        )
      })}
    </div>
  )
}