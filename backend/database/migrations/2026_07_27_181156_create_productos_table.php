<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de productos.
     */
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();

            /*
             * Cada producto pertenece a una categoría.
             */
            $table
                ->foreignId('categoria_id')
                ->constrained('categorias')
                ->restrictOnDelete();

            $table->string('nombre', 120);

            $table
                ->text('descripcion')
                ->nullable();

            $table->decimal('precio', 10, 2);

            /*
             * Por ahora se guardará una URL de imagen.
             */
            $table
                ->string('imagen', 500)
                ->nullable();

            $table
                ->boolean('activo')
                ->default(true);

            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla de productos.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};