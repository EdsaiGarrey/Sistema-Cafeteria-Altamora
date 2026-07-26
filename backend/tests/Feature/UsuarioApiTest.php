<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UsuarioApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Crea y autentica un administrador temporal.
     */
    private function autenticarAdministrador(): User
    {
        $administrador = User::factory()->create([
            'role' => User::ROL_ADMINISTRADOR,
        ]);

        Sanctum::actingAs($administrador);

        return $administrador;
    }

    /**
     * Un visitante sin token no puede consultar usuarios.
     */
    public function test_visitante_no_puede_consultar_usuarios(): void
    {
        $respuesta = $this->getJson(
            '/api/usuarios'
        );

        $respuesta->assertUnauthorized();
    }

    /**
     * Un empleado autenticado no puede ingresar
     * al módulo administrativo de usuarios.
     */
    public function test_empleado_no_puede_consultar_usuarios(): void
    {
        $empleado = User::factory()->create([
            'role' => User::ROL_EMPLEADO,
        ]);

        Sanctum::actingAs($empleado);

        $respuesta = $this->getJson(
            '/api/usuarios'
        );

        $respuesta
            ->assertForbidden()
            ->assertJson([
                'correcto' => false,
                'rol_actual' => User::ROL_EMPLEADO,
            ]);
    }

    /**
     * El administrador puede consultar usuarios
     * utilizando búsqueda, filtro y paginación.
     */
    public function test_administrador_puede_listar_usuarios(): void
    {
        $this->autenticarAdministrador();

        User::factory()->create([
            'name' => 'BusquedaUnicaAltamora',
            'email' => 'gerente.lista@altamora.test',
            'role' => User::ROL_GERENTE,
        ]);

        User::factory()->create([
            'name' => 'Empleado Diferente',
            'email' => 'empleado.lista@altamora.test',
            'role' => User::ROL_EMPLEADO,
        ]);

        $respuesta = $this->getJson(
            '/api/usuarios'
            .'?buscar=BusquedaUnicaAltamora'
            .'&role=gerente'
            .'&por_pagina=5'
        );

        $respuesta
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonCount(
                1,
                'data'
            )
            ->assertJsonPath(
                'data.0.nombre',
                'BusquedaUnicaAltamora'
            )
            ->assertJsonPath(
                'data.0.rol',
                User::ROL_GERENTE
            );
    }

    /**
     * El administrador puede registrar
     * un usuario con un rol válido.
     */
    public function test_administrador_puede_registrar_usuario(): void
    {
        $this->autenticarAdministrador();

        $respuesta = $this->postJson(
            '/api/usuarios',
            [
                'name' => 'Nuevo Gerente',
                'email' => 'nuevo.gerente@altamora.test',
                'password' => 'Usuario2026!',
                'password_confirmation' => 'Usuario2026!',
                'role' => User::ROL_GERENTE,
            ]
        );

        $respuesta
            ->assertCreated()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'usuario.nombre',
                'Nuevo Gerente'
            )
            ->assertJsonPath(
                'usuario.correo',
                'nuevo.gerente@altamora.test'
            )
            ->assertJsonPath(
                'usuario.rol',
                User::ROL_GERENTE
            );

        $this->assertDatabaseHas(
            'users',
            [
                'email' => 'nuevo.gerente@altamora.test',
                'role' => User::ROL_GERENTE,
            ]
        );

        $usuario = User::query()
            ->where(
                'email',
                'nuevo.gerente@altamora.test'
            )
            ->firstOrFail();

        $this->assertTrue(
            Hash::check(
                'Usuario2026!',
                $usuario->password
            )
        );
    }

    /**
     * El registro rechaza correos repetidos,
     * roles inválidos y contraseñas débiles.
     */
    public function test_registro_valida_los_datos_del_usuario(): void
    {
        $this->autenticarAdministrador();

        User::factory()->create([
            'email' => 'repetido@altamora.test',
            'role' => User::ROL_EMPLEADO,
        ]);

        $respuesta = $this->postJson(
            '/api/usuarios',
            [
                'name' => 'Usuario Inválido',
                'email' => 'repetido@altamora.test',
                'password' => '123',
                'password_confirmation' => '456',
                'role' => 'superusuario',
            ]
        );

        $respuesta
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'email',
                'password',
                'role',
            ]);
    }

    /**
     * El administrador puede actualizar
     * los datos y el rol de otro usuario.
     */
    public function test_administrador_puede_actualizar_usuario(): void
    {
        $this->autenticarAdministrador();

        $usuario = User::factory()->create([
            'name' => 'Empleado Original',
            'email' => 'empleado.original@altamora.test',
            'role' => User::ROL_EMPLEADO,
        ]);

        $respuesta = $this->patchJson(
            "/api/usuarios/{$usuario->id}",
            [
                'name' => 'Gerente Actualizado',
                'email' => 'gerente.actualizado@altamora.test',
                'role' => User::ROL_GERENTE,
            ]
        );

        $respuesta
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            )
            ->assertJsonPath(
                'usuario.nombre',
                'Gerente Actualizado'
            )
            ->assertJsonPath(
                'usuario.rol',
                User::ROL_GERENTE
            );

        $this->assertDatabaseHas(
            'users',
            [
                'id' => $usuario->id,
                'name' => 'Gerente Actualizado',
                'email' => 'gerente.actualizado@altamora.test',
                'role' => User::ROL_GERENTE,
            ]
        );
    }

    /**
     * El administrador no puede quitarse
     * su propio rol administrativo.
     */
    public function test_administrador_no_puede_cambiar_su_propio_rol(): void
    {
        $administrador =
            $this->autenticarAdministrador();

        $respuesta = $this->patchJson(
            "/api/usuarios/{$administrador->id}",
            [
                'role' => User::ROL_EMPLEADO,
            ]
        );

        $respuesta
            ->assertUnprocessable()
            ->assertJsonPath(
                'correcto',
                false
            )
            ->assertJsonPath(
                'mensaje',
                'No puedes quitarte tu propio rol de administrador.'
            );

        $this->assertDatabaseHas(
            'users',
            [
                'id' => $administrador->id,
                'role' => User::ROL_ADMINISTRADOR,
            ]
        );
    }

    /**
     * El administrador puede eliminar
     * la cuenta de otro usuario.
     */
    public function test_administrador_puede_eliminar_otro_usuario(): void
    {
        $this->autenticarAdministrador();

        $empleado = User::factory()->create([
            'role' => User::ROL_EMPLEADO,
        ]);

        $respuesta = $this->deleteJson(
            "/api/usuarios/{$empleado->id}"
        );

        $respuesta
            ->assertOk()
            ->assertJson([
                'correcto' => true,
                'mensaje' =>
                    'El usuario fue eliminado correctamente.',
            ]);

        $this->assertDatabaseMissing(
            'users',
            [
                'id' => $empleado->id,
            ]
        );
    }

    /**
     * El administrador no puede eliminar
     * su propia cuenta.
     */
    public function test_administrador_no_puede_eliminarse_a_si_mismo(): void
    {
        $administrador =
            $this->autenticarAdministrador();

        $respuesta = $this->deleteJson(
            "/api/usuarios/{$administrador->id}"
        );

        $respuesta
            ->assertUnprocessable()
            ->assertJson([
                'correcto' => false,
                'mensaje' =>
                    'No puedes eliminar tu propia cuenta.',
            ]);

        $this->assertDatabaseHas(
            'users',
            [
                'id' => $administrador->id,
            ]
        );
    }
}
