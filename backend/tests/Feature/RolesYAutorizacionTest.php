<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RolesYAutorizacionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Autentica un usuario temporal con el rol indicado.
     */
    private function autenticarConRol(string $rol): User
    {
        $usuario = User::factory()->create([
            'role' => $rol,
        ]);

        Sanctum::actingAs($usuario);

        return $usuario;
    }

    /**
     * Un visitante sin sesión no puede utilizar
     * ninguna ruta protegida.
     */
    public function test_usuario_no_autenticado_recibe_error_401(): void
    {
        $respuesta = $this->getJson(
            '/api/autorizacion/operacion'
        );

        $respuesta->assertUnauthorized();
    }

    /**
     * El empleado puede ingresar al área operativa.
     */
    public function test_empleado_puede_acceder_al_area_operativa(): void
    {
        $this->autenticarConRol(
            User::ROL_EMPLEADO
        );

        $respuesta = $this->getJson(
            '/api/autorizacion/operacion'
        );

        $respuesta
            ->assertOk()
            ->assertJson([
                'correcto' => true,
                'mensaje' =>
                    'Tienes acceso al área operativa.',
            ]);
    }

    /**
     * El empleado no puede ingresar al área administrativa.
     */
    public function test_empleado_recibe_error_403_en_administracion(): void
    {
        $this->autenticarConRol(
            User::ROL_EMPLEADO
        );

        $respuesta = $this->getJson(
            '/api/autorizacion/administracion'
        );

        $respuesta
            ->assertForbidden()
            ->assertJson([
                'correcto' => false,
                'rol_actual' => User::ROL_EMPLEADO,
            ]);
    }

    /**
     * El gerente puede ingresar al área de gestión.
     */
    public function test_gerente_puede_acceder_al_area_de_gestion(): void
    {
        $this->autenticarConRol(
            User::ROL_GERENTE
        );

        $respuesta = $this->getJson(
            '/api/autorizacion/gestion'
        );

        $respuesta
            ->assertOk()
            ->assertJson([
                'correcto' => true,
                'mensaje' =>
                    'Tienes acceso al área de gestión.',
            ]);
    }

    /**
     * El gerente no puede ingresar al área administrativa.
     */
    public function test_gerente_recibe_error_403_en_administracion(): void
    {
        $this->autenticarConRol(
            User::ROL_GERENTE
        );

        $respuesta = $this->getJson(
            '/api/autorizacion/administracion'
        );

        $respuesta
            ->assertForbidden()
            ->assertJson([
                'correcto' => false,
                'rol_actual' => User::ROL_GERENTE,
            ]);
    }

    /**
     * El administrador puede ingresar a todas
     * las áreas protegidas del sistema.
     */
    public function test_administrador_puede_acceder_a_todas_las_areas(): void
    {
        $this->autenticarConRol(
            User::ROL_ADMINISTRADOR
        );

        $this
            ->getJson('/api/autorizacion/operacion')
            ->assertOk();

        $this
            ->getJson('/api/autorizacion/gestion')
            ->assertOk();

        $this
            ->getJson('/api/autorizacion/administracion')
            ->assertOk();
    }
}
