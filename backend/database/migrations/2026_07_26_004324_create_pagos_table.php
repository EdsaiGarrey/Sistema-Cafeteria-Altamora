<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla utilizada para registrar
     * los pagos realizados sobre los pedidos.
     */
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            // Identificador único del pago.
            $table->id();

            /*
             * Pedido al que pertenece el pago.
             * Un pedido podrá tener uno o varios pagos.
             */
            $table->foreignId('pedido_id')
                ->constrained('pedidos')
                ->restrictOnDelete();

            /*
             * Usuario que recibió o registró el pago.
             */
            $table->foreignId('usuario_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * Método utilizado:
             * - efectivo
             * - tarjeta
             * - transferencia
             * - otro
             */
            $table->string('metodo_pago', 30);

            // Cantidad aplicada al pedido.
            $table->decimal('monto', 12, 2);

            /*
             * Cantidad entregada por el cliente.
             * Se utiliza principalmente en pagos en efectivo.
             */
            $table->decimal('monto_recibido', 12, 2)
                ->nullable();

            /*
             * Cambio entregado al cliente.
             * Se calcula cuando el pago se realiza en efectivo.
             */
            $table->decimal('cambio', 12, 2)
                ->default(0);

            /*
             * Referencia de tarjeta, transferencia
             * o plataforma de pago.
             */
            $table->string('referencia', 120)
                ->nullable();

            /*
             * Estado del pago:
             * - pendiente
             * - aprobado
             * - rechazado
             * - cancelado
             * - reembolsado
             */
            $table->string('estado', 30)
                ->default('aprobado');

            // Fecha y hora en que se procesó el pago.
            $table->timestamp('pagado_en')
                ->useCurrent();

            // Comentarios relacionados con el pago.
            $table->text('observaciones')
                ->nullable();

            // Fechas automáticas de creación y actualización.
            $table->timestamps();

            // Índices para búsquedas frecuentes.
            $table->index('metodo_pago');
            $table->index('estado');
            $table->index('pagado_en');
        });
    }

    /**
     * Elimina la tabla de pagos.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};