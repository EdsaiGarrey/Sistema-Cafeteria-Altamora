<?php

namespace Tests\Feature;

use App\Models\Caja;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CajaApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_gerente_puede_abrir_caja(): void
    {
        $usuario = User::factory()->create([
            'role' => 'gerente',
        ]);

        Sanctum::actingAs($usuario);

        $respuesta = $this->postJson(
            '/api/cajas/abrir',
            [
                'monto_inicial' => 500,
            ]
        );

        $respuesta
            ->assertCreated()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'caja.estado',
                'abierta'
            )
            ->assertJsonPath(
                'caja.monto_inicial',
                '500.00'
            );

        $this->assertDatabaseHas(
            'cajas',
            [
                'usuario_apertura_id' =>
                    $usuario->id,

                'monto_inicial' =>
                    500,

                'estado' =>
                    'abierta',
            ]
        );
    }

    public function test_no_permite_dos_cajas_abiertas(): void
    {
        $usuario = User::factory()->create([
            'role' => 'administrador',
        ]);

        Caja::create([
            'usuario_apertura_id' =>
                $usuario->id,

            'monto_inicial' =>
                300,

            'estado' =>
                'abierta',

            'abierta_en' =>
                now(),
        ]);

        Sanctum::actingAs($usuario);

        $this->postJson(
            '/api/cajas/abrir',
            [
                'monto_inicial' =>
                    500,
            ]
        )
            ->assertUnprocessable()
            ->assertJsonPath(
                'correcto',
                false
            )
            ->assertJsonPath(
                'errors.monto_inicial.0',
                'Debes cerrar la caja actual antes de abrir otra.'
            );

        $this->assertDatabaseCount(
            'cajas',
            1
        );
    }

    public function test_empleado_puede_consultar_caja_activa(): void
    {
        $gerente = User::factory()->create([
            'role' => 'gerente',
        ]);

        $empleado = User::factory()->create([
            'role' => 'empleado',
        ]);

        $caja = Caja::create([
            'usuario_apertura_id' =>
                $gerente->id,

            'monto_inicial' =>
                700,

            'estado' =>
                'abierta',

            'abierta_en' =>
                now(),
        ]);

        Sanctum::actingAs($empleado);

        $this->getJson('/api/cajas/activa')
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'caja.id',
                $caja->id
            )
            ->assertJsonPath(
                'caja.estado',
                'abierta'
            )
            ->assertJsonPath(
                'caja.usuario_apertura.id',
                $gerente->id
            );
    }
        /**
     * El administrador puede realizar
     * el corte y cerrar la caja.
     */
    public function test_administrador_puede_cerrar_caja(): void
    {
        $usuario = User::factory()->create([
            'role' => 'administrador',
        ]);

        Caja::create([
            'usuario_apertura_id' =>
                $usuario->id,

            'monto_inicial' =>
                1000,

            'estado' =>
                'abierta',

            'abierta_en' =>
                now(),
        ]);

        Sanctum::actingAs($usuario);

        $respuesta = $this->postJson(
            '/api/cajas/cerrar',
            [
                'monto_final_real' =>
                    1000,

                'observaciones' =>
                    'Corte sin diferencias.',
            ]
        );

        $respuesta
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'caja.estado',
                'cerrada'
            )
            ->assertJsonPath(
                'caja.monto_final_esperado',
                '1000.00'
            )
            ->assertJsonPath(
                'caja.monto_final_real',
                '1000.00'
            )
            ->assertJsonPath(
                'caja.diferencia',
                '0.00'
            )
            ->assertJsonPath(
                'caja.usuario_cierre.id',
                $usuario->id
            );

        $this->assertDatabaseHas(
            'cajas',
            [
                'usuario_cierre_id' =>
                    $usuario->id,

                'estado' =>
                    'cerrada',

                'monto_final_esperado' =>
                    1000,

                'monto_final_real' =>
                    1000,

                'diferencia' =>
                    0,
            ]
        );
    }
}
