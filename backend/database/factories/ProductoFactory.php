<?php

namespace Database\Factories;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Producto>
 */
class ProductoFactory extends Factory
{
    /**
     * Genera productos para las pruebas.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'categoria_id' => Categoria::factory(),

            'nombre' => fake()
                ->unique()
                ->words(2, true),

            'descripcion' => fake()
                ->optional()
                ->sentence(),

            'precio' => fake()
                ->randomFloat(2, 20, 200),

            'imagen' => null,

            'activo' => true,
        ];
    }
}