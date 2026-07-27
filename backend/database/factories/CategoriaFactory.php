<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\Categoria>
 */
class CategoriaFactory extends Factory
{
    /**
     * Genera datos de prueba para categorías.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nombre = ucwords(
            fake()->unique()->words(2, true)
        );

        return [
            'nombre' => $nombre,

            /*
             * Se agrega un número para evitar que
             * dos categorías generen el mismo slug.
             */
            'slug' => Str::slug($nombre)
                . '-'
                . fake()->unique()->numberBetween(
                    1000,
                    9999
                ),

            'descripcion' => fake()->optional()->sentence(),

            'activo' => fake()->boolean(85),
        ];
    }
}