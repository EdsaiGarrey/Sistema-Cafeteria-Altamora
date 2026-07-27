<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoriaApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Autentica un usuario con el rol indicado.
     */
    private function autenticar(string $rol): User
    {
        $usuario = User::factory()->create([
            'role' => $rol,
        ]);

        Sanctum::actingAs($usuario);

        return $usuario;
    }

    /**
     * Un visitante no puede consultar categorías.
     */
    public function test_visitante_no_puede_consultar_categorias(): void
    {
        $this->getJson('/api/categorias')
            ->assertUnauthorized();
    }

    /**
     * Un empleado no puede administrar categorías.
     */
    public function test_empleado_no_puede_consultar_categorias(): void
    {
        $this->autenticar(User::ROL_EMPLEADO);

        $this->getJson('/api/categorias')
            ->assertForbidden();
    }

    /**
     * Un gerente puede consultar categorías.
     */
    public function test_gerente_puede_consultar_categorias(): void
    {
        $this->autenticar(User::ROL_GERENTE);

        Categoria::factory()->create([
            'nombre' => 'Bebidas calientes',
            'slug' => 'bebidas-calientes',
        ]);

        $this->getJson('/api/categorias')
            ->assertOk()
            ->assertJsonPath(
                'data.0.nombre',
                'Bebidas calientes'
            );
    }

    /**
     * El administrador puede realizar
     * el CRUD completo de categorías.
     */
    public function test_administrador_puede_realizar_crud(): void
    {
        $this->autenticar(
            User::ROL_ADMINISTRADOR
        );

        // Registrar.
        $respuestaCrear = $this->postJson(
            '/api/categorias',
            [
                'nombre' => 'Postres',
                'descripcion' =>
                    'Pasteles, panes y postres.',
                'activo' => true,
            ]
        );

        $respuestaCrear
            ->assertCreated()
            ->assertJsonPath(
                'categoria.nombre',
                'Postres'
            )
            ->assertJsonPath(
                'categoria.slug',
                'postres'
            );

        $categoriaId = $respuestaCrear->json(
            'categoria.id'
        );

        // Consultar.
        $this->getJson(
            "/api/categorias/{$categoriaId}"
        )
            ->assertOk()
            ->assertJsonPath(
                'categoria.nombre',
                'Postres'
            );

        // Actualizar.
        $this->patchJson(
            "/api/categorias/{$categoriaId}",
            [
                'nombre' => 'Repostería',
                'activo' => false,
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'categoria.nombre',
                'Repostería'
            )
            ->assertJsonPath(
                'categoria.slug',
                'reposteria'
            )
            ->assertJsonPath(
                'categoria.activo',
                false
            );

        // Eliminar.
        $this->deleteJson(
            "/api/categorias/{$categoriaId}"
        )
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            );

        $this->assertDatabaseMissing(
            'categorias',
            [
                'id' => $categoriaId,
            ]
        );
    }
}