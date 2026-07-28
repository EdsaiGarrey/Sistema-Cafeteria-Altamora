<?php

namespace Tests\Feature;

use App\Models\Caja;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PedidoApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Comprueba la creación, consulta
     * y actualización de un pedido.
     */
    public function test_usuario_autenticado_puede_gestionar_pedidos(): void
    {
        $usuario = User::factory()->create();

        $producto = Producto::factory()->create([
            'precio' => 45.50,
            'activo' => true,
        ]);

        $caja = Caja::create([
            'usuario_apertura_id' => $usuario->id,
            'monto_inicial' => 500,
            'estado' => 'abierta',
            'abierta_en' => now(),
        ]);

        Sanctum::actingAs($usuario);

        $respuestaCreacion = $this->postJson(
            '/api/pedidos',
            [
                'caja_id' => $caja->id,

                'cliente_nombre' =>
                    'Cliente automático',

                'tipo_servicio' =>
                    'local',

                'notas' =>
                    'Pedido creado desde una prueba.',

                'productos' => [
                    [
                        'producto_id' =>
                            $producto->id,

                        'cantidad' =>
                            2,
                    ],
                ],
            ]
        );

        $respuestaCreacion
            ->assertCreated()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'pedido.estado',
                'pendiente'
            )
            ->assertJsonPath(
                'pedido.cliente_nombre',
                'Cliente automático'
            )
            ->assertJsonPath(
                'pedido.productos.0.producto.id',
                $producto->id
            )
            ->assertJsonPath(
                'pedido.productos.0.cantidad',
                2
            );

        $pedidoId = $respuestaCreacion->json(
            'pedido.id'
        );

        /*
         * Comprueba que se guardó el producto
         * relacionado con el pedido.
         */
        $this->assertDatabaseHas(
            'detalle_pedidos',
            [
                'pedido_id' =>
                    $pedidoId,

                'producto_id' =>
                    $producto->id,

                'cantidad' =>
                    2,
            ]
        );

        $this->getJson(
            '/api/pedidos?estado=pendiente'
        )
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonFragment([
                'id' => $pedidoId,
            ]);

        $this->getJson(
            "/api/pedidos/{$pedidoId}"
        )
            ->assertOk()
            ->assertJsonPath(
                'pedido.id',
                $pedidoId
            );

        $this->patchJson(
            "/api/pedidos/{$pedidoId}",
            [
                'estado' =>
                    'en_preparacion',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'pedido.estado',
                'en_preparacion'
            );
    }

    /**
     * Comprueba que no se creen pedidos
     * dentro de cajas cerradas.
     */
    public function test_no_se_puede_crear_pedido_en_caja_cerrada(): void
    {
        $usuario = User::factory()->create();

        $producto = Producto::factory()->create([
            'activo' => true,
        ]);

        $caja = Caja::create([
            'usuario_apertura_id' =>
                $usuario->id,

            'usuario_cierre_id' =>
                $usuario->id,

            'monto_inicial' =>
                500,

            'estado' =>
                'cerrada',

            'abierta_en' =>
                now()->subHour(),

            'cerrada_en' =>
                now(),
        ]);

        Sanctum::actingAs($usuario);

        $this->postJson(
            '/api/pedidos',
            [
                'caja_id' =>
                    $caja->id,

                'tipo_servicio' =>
                    'local',

                /*
                 * Se envía un producto válido para
                 * que la petición llegue a comprobar
                 * el estado de la caja.
                 */
                'productos' => [
                    [
                        'producto_id' =>
                            $producto->id,

                        'cantidad' =>
                            1,
                    ],
                ],
            ]
        )
            ->assertUnprocessable()
            ->assertJsonPath(
                'correcto',
                false
            )
            ->assertJsonPath(
                'errors.caja_id.0',
                'La caja seleccionada está cerrada.'
            );
    }

    /**
     * Comprueba que las rutas
     * exijan autenticación.
     */
    public function test_usuario_sin_token_no_puede_consultar_pedidos(): void
    {
        $this->getJson('/api/pedidos')
            ->assertUnauthorized();
    }
}