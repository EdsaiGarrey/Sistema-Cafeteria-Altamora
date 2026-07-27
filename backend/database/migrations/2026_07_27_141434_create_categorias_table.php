<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla donde se almacenan
     * las categorías de los productos.
     */
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();

            /*
             * Nombre visible de la categoría.
             * No se permiten nombres repetidos.
             */
            $table
                ->string('nombre', 120)
                ->unique();

            /*
             * Versión del nombre preparada para
             * utilizarse en rutas y búsquedas.
             */
            $table
                ->string('slug', 140)
                ->unique();

            /*
             * Información adicional opcional
             * sobre la categoría.
             */
            $table
                ->text('descripcion')
                ->nullable();

            /*
             * Permite ocultar una categoría sin
             * eliminarla físicamente de la base.
             */
            $table
                ->boolean('activo')
                ->default(true)
                ->index();

            $table->timestamps();
        });
    }

    /**
     * Elimina la tabla de categorías.
     */
    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};