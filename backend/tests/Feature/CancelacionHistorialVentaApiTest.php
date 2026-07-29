<?php

namespace Tests\Feature;

use App\Models\Caja;
use App\Models\Pago;
use App\Models\Pedido;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CancelacionHistorialVentaApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Comprueba permisos y registro de la cancelación.
     */
    public function test_solo_gerente_o_administrador_puede_cancelar(): void
    {
        $gerente = User::factory()->create([
            'role' => 'gerente',
        ]);

        $empleado = User::factory()->create([
            'role' => 'empleado',
        ]);

        $caja = $this->crearCaja($gerente);

        $ventaPermitida = $this->crearVenta(
            $empleado,
            $caja,
            120
        );

        $ventaBloqueada = $this->crearVenta(
            $empleado,
            $caja,
            80
        );

        /*
         * Un empleado no puede autorizar cancelaciones.
         */
        Sanctum::actingAs($empleado);

        $this->patchJson(
            "/api/pedidos/{$ventaBloqueada->id}/cancelar",
            [
                'motivo_cancelacion' =>
                    'Cancelación solicitada por el cliente.',
            ]
        )->assertForbidden();

        /*
         * El gerente sí puede cancelar el ticket.
         */
        Sanctum::actingAs($gerente);

        $this->patchJson(
            "/api/pedidos/{$ventaPermitida->id}/cancelar",
            [
                'motivo_cancelacion' =>
                    'El pedido fue registrado incorrectamente.',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'pedido.estado',
                'cancelado'
            )
            ->assertJsonPath(
                'pedido.cancelado_por.id',
                $gerente->id
            );

        $this->assertDatabaseHas('pedidos', [
            'id' => $ventaPermitida->id,
            'estado' => 'cancelado',
            'cancelado_por_id' => $gerente->id,
            'motivo_cancelacion' =>
                'El pedido fue registrado incorrectamente.',
        ]);

        /*
         * El pago permanece guardado como evidencia.
         */
        $this->assertDatabaseHas('pagos', [
            'pedido_id' => $ventaPermitida->id,
            'estado' => 'aprobado',
        ]);
    }

    /**
     * Comprueba el motivo obligatorio y evita duplicados.
     */
    public function test_cancelacion_requiere_motivo_y_no_se_repite(): void
    {
        $gerente = User::factory()->create([
            'role' => 'gerente',
        ]);

        $empleado = User::factory()->create([
            'role' => 'empleado',
        ]);

        $caja = $this->crearCaja($gerente);

        $venta = $this->crearVenta(
            $empleado,
            $caja,
            100
        );

        Sanctum::actingAs($gerente);

        $this->patchJson(
            "/api/pedidos/{$venta->id}/cancelar",
            []
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'motivo_cancelacion',
            ]);

        $this->patchJson(
            "/api/pedidos/{$venta->id}/cancelar",
            [
                'motivo_cancelacion' =>
                    'El cliente solicitó cancelar el ticket.',
            ]
        )->assertOk();

        $this->patchJson(
            "/api/pedidos/{$venta->id}/cancelar",
            [
                'motivo_cancelacion' =>
                    'Segundo intento de cancelación.',
            ]
        )
            ->assertUnprocessable()
            ->assertJsonPath(
                'errors.pedido.0',
                'Este ticket ya fue cancelado anteriormente.'
            );
    }

    /**
     * Comprueba el listado y detalle del historial.
     */
    public function test_historial_muestra_solamente_ventas_pagadas(): void
    {
        $gerente = User::factory()->create([
            'role' => 'gerente',
        ]);

        $empleado = User::factory()->create([
            'role' => 'empleado',
        ]);

        $caja = $this->crearCaja($gerente);

        $ventaPagada = $this->crearVenta(
            $empleado,
            $caja,
            150
        );

        $pedidoSinPago = $this->crearPedido(
            $empleado,
            $caja,
            90
        );

        Sanctum::actingAs($empleado);

        $respuesta = $this->getJson(
            '/api/historial-ventas'
        );

        $respuesta
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            );

        $identificadores = collect(
            $respuesta->json('data')
        )->pluck('id');

        $this->assertContains(
            $ventaPagada->id,
            $identificadores
        );

        $this->assertNotContains(
            $pedidoSinPago->id,
            $identificadores
        );

        $this->getJson(
            "/api/historial-ventas/{$ventaPagada->id}"
        )
            ->assertOk()
            ->assertJsonPath(
                'venta.id',
                $ventaPagada->id
            );

        $this->getJson(
            "/api/historial-ventas/{$pedidoSinPago->id}"
        )->assertNotFound();
    }

    /**
     * Comprueba que una venta cancelada no cuente en caja.
     */
    public function test_venta_cancelada_no_se_suma_al_corte(): void
    {
        $gerente = User::factory()->create([
            'role' => 'gerente',
        ]);

        $empleado = User::factory()->create([
            'role' => 'empleado',
        ]);

        $caja = $this->crearCaja(
            $gerente,
            500
        );

        $this->crearVenta(
            $empleado,
            $caja,
            100
        );

        $ventaCancelada = $this->crearVenta(
            $empleado,
            $caja,
            50
        );

        Sanctum::actingAs($gerente);

        $this->patchJson(
            "/api/pedidos/{$ventaCancelada->id}/cancelar",
            [
                'motivo_cancelacion' =>
                    'Venta anulada por un error de captura.',
            ]
        )->assertOk();

        $this->getJson('/api/cajas/activa')
            ->assertOk()
            ->assertJsonPath(
                'resumen.total_vendido',
                100
            )
            ->assertJsonPath(
                'resumen.efectivo_esperado',
                600
            );
    }

    /**
     * Crea una caja abierta para las pruebas.
     */
    private function crearCaja(
        User $responsable,
        float $montoInicial = 500
    ): Caja {
        return Caja::create([
            'usuario_apertura_id' =>
                $responsable->id,

            'monto_inicial' =>
                $montoInicial,

            'estado' =>
                'abierta',

            'abierta_en' =>
                now(),
        ]);
    }

    /**
     * Crea un pedido sin pago.
     */
    private function crearPedido(
        User $usuario,
        Caja $caja,
        float $total
    ): Pedido {
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
                'entregado',

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

            'completado_en' =>
                now(),
        ]);
    }

    /**
     * Crea un pedido acompañado de un pago aprobado.
     */
    private function crearVenta(
        User $usuario,
        Caja $caja,
        float $total
    ): Pedido {
        $pedido = $this->crearPedido(
            $usuario,
            $caja,
            $total
        );

        Pago::create([
            'pedido_id' =>
                $pedido->id,

            'usuario_id' =>
                $usuario->id,

            'metodo_pago' =>
                'efectivo',

            'monto' =>
                $total,

            'monto_recibido' =>
                $total,

            'cambio' =>
                0,

            'estado' =>
                'aprobado',

            'pagado_en' =>
                now(),
        ]);

        return $pedido;
    }
}