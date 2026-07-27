<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductoApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Autentica un usuario con el rol indicado.
     */
    private function autenticar(string $rol): void
    {
        $usuario = User::factory()->create([
            'role' => $rol,
        ]);

        Sanctum::actingAs($usuario);
    }

    /**
     * Un visitante no puede consultar productos.
     */
    public function test_visitante_no_puede_consultar_productos(): void
    {
        $this->getJson('/api/productos')
            ->assertUnauthorized();
    }

    /**
     * Un empleado no puede administrar productos.
     */
    public function test_empleado_no_puede_consultar_productos(): void
    {
        $this->autenticar(User::ROL_EMPLEADO);

        $this->getJson('/api/productos')
            ->assertForbidden();
    }

    /**
     * Un gerente puede consultar productos.
     */
    public function test_gerente_puede_consultar_productos(): void
    {
        $this->autenticar(User::ROL_GERENTE);

        Producto::factory()->create([
            'nombre' => 'Café americano',
        ]);

        $this->getJson('/api/productos')
            ->assertOk()
            ->assertJsonPath(
                'data.0.nombre',
                'Café americano'
            );
    }

    /**
     * El administrador puede realizar
     * el CRUD completo de productos.
     */
    public function test_administrador_puede_realizar_crud(): void
    {
        $this->autenticar(
            User::ROL_ADMINISTRADOR
        );

        $categoria = Categoria::factory()->create([
            'nombre' => 'Bebidas calientes',
            'slug' => 'bebidas-calientes',
            'activo' => true,
        ]);

        // Registrar producto.
        $respuestaCrear = $this->postJson(
            '/api/productos',
            [
                'categoria_id' => $categoria->id,
                'nombre' => 'Capuchino',
                'descripcion' =>
                    'Café con leche y espuma.',
                'precio' => 65,
                'imagen' => null,
                'activo' => true,
            ]
        );

        $respuestaCrear
            ->assertCreated()
            ->assertJsonPath(
                'producto.nombre',
                'Capuchino'
            )
            ->assertJsonPath(
                'producto.categoria.nombre',
                'Bebidas calientes'
            );

        $productoId = $respuestaCrear->json(
            'producto.id'
        );

        // Consultar producto.
        $this->getJson(
            "/api/productos/{$productoId}"
        )
            ->assertOk()
            ->assertJsonPath(
                'producto.nombre',
                'Capuchino'
            );

        // Actualizar producto.
        $this->patchJson(
            "/api/productos/{$productoId}",
            [
                'nombre' => 'Capuchino grande',
                'precio' => 75,
                'activo' => false,
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'producto.nombre',
                'Capuchino grande'
            )
            ->assertJsonPath(
                'producto.activo',
                false
            );

        // Eliminar producto.
        $this->deleteJson(
            "/api/productos/{$productoId}"
        )
            ->assertOk()
            ->assertJsonPath(
                'correcto',
                true
            );

        $this->assertDatabaseMissing(
            'productos',
            [
                'id' => $productoId,
            ]
        );
    }
}