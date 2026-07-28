<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla que almacena los productos
     * incluidos dentro de cada pedido.
     */
    public function up(): void
    {
        Schema::create('detalle_pedidos', function (Blueprint $table) {
            $table->id();

            /*
             * Al eliminar un pedido también se eliminan
             * automáticamente todos sus detalles.
             */
            $table->foreignId('pedido_id')
                ->constrained('pedidos')
                ->cascadeOnDelete();

            /*
             * No se permite eliminar un producto que ya
             * forma parte del historial de un pedido.
             */
            $table->foreignId('producto_id')
                ->constrained('productos')
                ->restrictOnDelete();

            $table->unsignedInteger('cantidad');

            $table->decimal(
                'precio_unitario',
                10,
                2
            );

            $table->decimal(
                'subtotal',
                10,
                2
            );

            $table->timestamps();

            /*
             * Evita guardar el mismo producto dos veces
             * dentro del mismo pedido.
             */
            $table->unique([
                'pedido_id',
                'producto_id',
            ]);
        });
    }

    /**
     * Elimina la tabla cuando se revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_pedidos');
    }
};