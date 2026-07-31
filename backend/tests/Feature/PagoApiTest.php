<?php

namespace Tests\Feature;

use App\Models\Caja;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PagoApiTest extends TestCase
{
    use RefreshDatabase;

    /**
 * Prepara una respuesta falsa de Meta durante las pruebas.
 */
protected function setUp(): void
{
    parent::setUp();

    Http::fake([
        'https://graph.facebook.com/*' =>
            Http::response(
                [
                    'messages' => [
                        [
                            'id' => 'wamid.prueba',
                        ],
                    ],
                ],
                200
            ),
    ]);
}
    /**
     * Comprueba el registro de un pago en efectivo,
     * el cálculo del cambio y el saldo pendiente.
     */
    public function test_usuario_puede_registrar_pago_en_efectivo(): void
    {
        $usuario = User::factory()->create([
            'role' => 'empleado',
        ]);

        $pedido = $this->crearPedido(
            $usuario,
            100
        );

        Sanctum::actingAs($usuario);

        $respuesta = $this->postJson(
            '/api/pagos',
            [
                'pedido_id' =>
                    $pedido->id,

                'cliente_telefono' =>
                    '9511234567',

                'metodo_pago' =>
                    'efectivo',

                'monto' =>
                    60,

                'monto_recibido' =>
                    100,

                'observaciones' =>
                    'Pago parcial en efectivo.',
            ]
        );

        $respuesta
            ->assertCreated()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'pago.metodo_pago',
                'efectivo'
            )
            ->assertJsonPath(
                'pago.monto',
                '60.00'
            )
            ->assertJsonPath(
                'pago.cambio',
                '40.00'
            )
            ->assertJsonPath(
                'saldo_pendiente',
                40
            );

        $pagoId = $respuesta->json(
            'pago.id'
        );

        /*
         * Comprueba que el pago fue guardado.
         */
        $this->assertDatabaseHas(
            'pagos',
            [
                'id' =>
                    $pagoId,

                'pedido_id' =>
                    $pedido->id,

                'usuario_id' =>
                    $usuario->id,

                'metodo_pago' =>
                    'efectivo',

                'monto' =>
                    60,

                'cambio' =>
                    40,

                'estado' =>
                    'aprobado',
            ]
        );

        /*
         * Comprueba que el teléfono de WhatsApp
         * fue guardado dentro del pedido.
         */
        $this->assertDatabaseHas(
            'pedidos',
            [
                'id' =>
                    $pedido->id,

                'cliente_telefono' =>
                    '9511234567',
            ]
        );

        /*
         * Comprueba el listado filtrado
         * por el pedido relacionado.
         */
        $this->getJson(
            "/api/pagos?pedido_id={$pedido->id}"
        )
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'data.0.id',
                $pagoId
            );

        /*
         * Comprueba la consulta individual.
         */
        $this->getJson(
            "/api/pagos/{$pagoId}"
        )
            ->assertOk()
            ->assertJsonPath(
                'pago.id',
                $pagoId
            );
    }

    /**
     * Comprueba que no se pueda pagar
     * más dinero que el saldo pendiente.
     */
    public function test_no_permite_pago_mayor_al_saldo_pendiente(): void
    {
        $usuario = User::factory()->create([
            'role' => 'empleado',
        ]);

        $pedido = $this->crearPedido(
            $usuario,
            100
        );

        Sanctum::actingAs($usuario);

        /*
         * Primero registra un pago parcial
         * de sesenta pesos.
         */
        $this->postJson(
            '/api/pagos',
            [
                'pedido_id' =>
                    $pedido->id,

                'cliente_telefono' =>
                    '9511234567',

                'metodo_pago' =>
                    'transferencia',

                'monto' =>
                    60,

                'referencia' =>
                    'TRANSFERENCIA-001',
            ]
        )->assertCreated();

        /*
         * Solo quedan cuarenta pesos pendientes,
         * por lo que cincuenta debe rechazarse.
         */
        $this->postJson(
            '/api/pagos',
            [
                'pedido_id' =>
                    $pedido->id,

                'cliente_telefono' =>
                    '9511234567',

                'metodo_pago' =>
                    'efectivo',

                'monto' =>
                    50,

                'monto_recibido' =>
                    50,
            ]
        )
            ->assertUnprocessable()
            ->assertJsonPath(
                'errors.monto.0',
                'El monto no puede superar el saldo pendiente.'
            );

        $this->assertDatabaseCount(
            'pagos',
            1
        );
    }

    /**
     * Comprueba que el efectivo entregado
     * no sea menor al monto del pago.
     */
    public function test_monto_recibido_debe_ser_suficiente(): void
    {
        $usuario = User::factory()->create([
            'role' => 'empleado',
        ]);

        $pedido = $this->crearPedido(
            $usuario,
            100
        );

        Sanctum::actingAs($usuario);

        $this->postJson(
            '/api/pagos',
            [
                'pedido_id' =>
                    $pedido->id,

                'cliente_telefono' =>
                    '9511234567',

                'metodo_pago' =>
                    'efectivo',

                'monto' =>
                    80,

                'monto_recibido' =>
                    50,
            ]
        )
            ->assertUnprocessable()
            ->assertJsonPath(
                'errors.monto_recibido.0',
                'El monto recibido no puede ser menor al pago.'
            );

        $this->assertDatabaseCount(
            'pagos',
            0
        );
    }

    /**
     * Comprueba que las rutas de pagos
     * exijan autenticación.
     */
    public function test_usuario_sin_token_no_puede_consultar_pagos(): void
    {
        $this->getJson('/api/pagos')
            ->assertUnauthorized();
    }

    /**
 * Comprueba que se envíe WhatsApp cuando el pedido
 * queda completamente pagado.
 */
public function test_envia_whatsapp_al_completar_el_pago(): void
{
    $usuario = User::factory()->create([
        'role' => 'empleado',
    ]);

    $pedido = $this->crearPedido(
        $usuario,
        100
    );

    Sanctum::actingAs($usuario);

    $respuesta = $this->postJson(
        '/api/pagos',
        [
            'pedido_id' =>
                $pedido->id,

            'cliente_telefono' =>
                '9511234567',

            'metodo_pago' =>
                'efectivo',

            'monto' =>
                100,

            'monto_recibido' =>
                100,
        ]
    );

    $respuesta
        ->assertCreated()
        ->assertJsonPath(
            'correcto',
            true
        )
        ->assertJsonPath(
            'saldo_pendiente',
            0
        )
        ->assertJsonPath(
            'whatsapp_enviado',
            true
        );

    /*
     * Confirma que el teléfono se guardó
     * dentro del pedido.
     */
    $this->assertDatabaseHas(
        'pedidos',
        [
            'id' =>
                $pedido->id,

            'cliente_telefono' =>
                '9511234567',
        ]
    );

    /*
     * Confirma que Laravel preparó la solicitud
     * destinada a la API de WhatsApp.
     */
    Http::assertSent(
        function (HttpRequest $solicitud): bool {
            $datos = $solicitud->data();

            return str_contains(
                $solicitud->url(),
                '/messages'
            )
                && ($datos['to'] ?? null) ===
                    '529511234567'
                && ($datos['type'] ?? null) ===
                    'template'
                && (
                    $datos['template']['name']
                    ?? null
                ) === 'hello_world';
        }
    );
}
    /**
     * Crea un pedido listo para probar pagos.
     */
    private function crearPedido(
        User $usuario,
        float $total
    ): Pedido {
        $caja = Caja::create([
            'usuario_apertura_id' =>
                $usuario->id,

            'monto_inicial' =>
                500,

            'estado' =>
                'abierta',

            'abierta_en' =>
                now(),
        ]);

        return Pedido::create([
            'folio' =>
                'PED-TEST-'
                . Str::upper(
                    Str::random(8)
                ),

            'caja_id' =>
                $caja->id,

            'usuario_id' =>
                $usuario->id,

            'cliente_nombre' =>
                'Cliente de prueba',

            'tipo_servicio' =>
                'local',

            'estado' =>
                'pendiente',

            'subtotal' =>
                $total,

            'descuento' =>
                0,

            'impuestos' =>
                0,

            'total' =>
                $total,

            'pedido_en' =>
                now(),
        ]);
    }
}