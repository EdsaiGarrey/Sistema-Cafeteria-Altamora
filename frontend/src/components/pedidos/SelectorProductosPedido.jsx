import {
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap'

/**
 * Convierte un precio al formato de moneda mexicana.
 */
function mostrarPrecio(valor) {
  return Number(valor ?? 0).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
    },
  )
}

/**
 * Busca la información completa de un producto.
 */
function buscarProducto(
  productosDisponibles,
  productoId,
) {
  return productosDisponibles.find(
    (producto) =>
      String(producto.id) === String(productoId),
  )
}

/**
 * Calcula el subtotal de una fila del carrito.
 */
function calcularSubtotal(
  item,
  productosDisponibles,
) {
  const producto = buscarProducto(
    productosDisponibles,
    item.producto_id,
  )

  const precio = Number(producto?.precio ?? 0)
  const cantidad = Number(item.cantidad ?? 0)

  if (
    !Number.isFinite(precio) ||
    !Number.isFinite(cantidad) ||
    cantidad <= 0
  ) {
    return 0
  }

  return precio * cantidad
}

/**
 * Permite seleccionar productos, cantidades
 * y consultar el total del pedido.
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
  const totalPedido = productosSeleccionados.reduce(
    (total, item) =>
      total +
      calcularSubtotal(
        item,
        productosDisponibles,
      ),
    0,
  )

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Form.Label className="mb-0 fw-semibold">
          Carrito del pedido
        </Form.Label>

        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={alAgregar}
          disabled={cargando}
        >
          Agregar producto
        </Button>
      </div>

      {errores.productos?.[0] && (
        <div className="text-danger small mb-2">
          {errores.productos[0]}
        </div>
      )}

      {productosSeleccionados.map(
        (item, indice) => {
          const errorProducto =
            errores[
              `productos.${indice}.producto_id`
            ]?.[0]

          const errorCantidad =
            errores[
              `productos.${indice}.cantidad`
            ]?.[0]

          const subtotal = calcularSubtotal(
            item,
            productosDisponibles,
          )

          return (
            <div
              key={indice}
              className="border rounded p-3 mb-2 bg-light"
            >
              <Row className="g-2 align-items-end">
                <Col md={6}>
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
                      isInvalid={Boolean(
                        errorProducto,
                      )}
                    >
                      <option value="">
                        {cargando
                          ? 'Cargando productos...'
                          : 'Selecciona un producto'}
                      </option>

                      {productosDisponibles.map(
                        (producto) => {
                          const productoRepetido =
                            productosSeleccionados.some(
                              (
                                productoSeleccionado,
                                posicion,
                              ) =>
                                posicion !== indice &&
                                String(
                                  productoSeleccionado
                                    .producto_id,
                                ) ===
                                  String(
                                    producto.id,
                                  ),
                            )

                          return (
                            <option
                              key={producto.id}
                              value={producto.id}
                              disabled={
                                productoRepetido
                              }
                            >
                              {producto.nombre} —{' '}
                              {mostrarPrecio(
                                producto.precio,
                              )}
                            </option>
                          )
                        },
                      )}
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                      {errorProducto}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={2}>
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
                      isInvalid={Boolean(
                        errorCantidad,
                      )}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errorCantidad}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group>
                    <Form.Label>
                      Subtotal
                    </Form.Label>

                    <div className="form-control bg-white fw-semibold">
                      {mostrarPrecio(subtotal)}
                    </div>
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
        },
      )}

      <div className="d-flex justify-content-between align-items-center border rounded p-3 mt-3 bg-white">
        <div>
          <strong>Total del pedido</strong>

          <div className="small text-muted">
            Calculado con los productos seleccionados
          </div>
        </div>

        <strong className="fs-4">
          {mostrarPrecio(totalPedido)}
        </strong>
      </div>
    </div>
  )
}