<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla principal de pedidos de la cafetería.
     */
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            // Identificador único del pedido.
            $table->id();

            /*
             * Folio visible utilizado para localizar
             * rápidamente un pedido o ticket.
             */
            $table->string('folio', 30)
                ->unique();

            /*
             * Caja abierta en la que fue registrado el pedido.
             * No podrá eliminarse una caja que tenga pedidos.
             */
            $table->foreignId('caja_id')
                ->constrained('cajas')
                ->restrictOnDelete();

            /*
             * Usuario que registró el pedido.
             * Normalmente será un empleado o administrador.
             */
            $table->foreignId('usuario_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * Nombre del cliente cuando sea necesario.
             * Puede permanecer vacío en ventas generales.
             */
            $table->string('cliente_nombre', 120)
                ->nullable();

            /*
             * Tipo de servicio:
             * - local
             * - llevar
             * - domicilio
             */
            $table->string('tipo_servicio', 20)
                ->default('local');

            /*
             * Estado operativo:
             * - pendiente
             * - confirmado
             * - en_preparacion
             * - listo
             * - entregado
             * - cancelado
             */
            $table->string('estado', 30)
                ->default('pendiente');

            // Suma de los productos antes de descuentos e impuestos.
            $table->decimal('subtotal', 12, 2)
                ->default(0);

            // Descuento aplicado al pedido.
            $table->decimal('descuento', 12, 2)
                ->default(0);

            // Impuestos calculados cuando correspondan.
            $table->decimal('impuestos', 12, 2)
                ->default(0);

            // Importe final que debe pagar el cliente.
            $table->decimal('total', 12, 2)
                ->default(0);

            // Comentarios o instrucciones especiales.
            $table->text('notas')
                ->nullable();

            // Fecha y hora en que se registró el pedido.
            $table->timestamp('pedido_en')
                ->useCurrent();

            // Fecha y hora en que el pedido fue completado.
            $table->timestamp('completado_en')
                ->nullable();

            // Fecha y hora en que el pedido fue cancelado.
            $table->timestamp('cancelado_en')
                ->nullable();

            // Explicación proporcionada al cancelar el pedido.
            $table->text('motivo_cancelacion')
                ->nullable();

            // Fechas automáticas de creación y actualización.
            $table->timestamps();

            // Índices para búsquedas frecuentes.
            $table->index('estado');
            $table->index('tipo_servicio');
            $table->index('pedido_en');
        });
    }

    /**
     * Elimina la tabla de pedidos.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};