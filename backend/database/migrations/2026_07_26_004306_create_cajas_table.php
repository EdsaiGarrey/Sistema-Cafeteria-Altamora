<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla utilizada para registrar
     * las aperturas y cierres de caja.
     */
    public function up(): void
    {
        Schema::create('cajas', function (Blueprint $table) {
            // Identificador único de la sesión de caja.
            $table->id();

            /*
             * Usuario responsable de realizar la apertura.
             * No podrá eliminarse mientras tenga cajas relacionadas.
             */
            $table->foreignId('usuario_apertura_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * Usuario que realizó el cierre.
             * Será nulo mientras la caja continúe abierta.
             */
            $table->foreignId('usuario_cierre_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Cantidad disponible al comenzar la jornada.
            $table->decimal('monto_inicial', 12, 2)
                ->default(0);

            /*
             * Cantidad que el sistema calcula que debe existir
             * al finalizar la sesión de caja.
             */
            $table->decimal('monto_final_esperado', 12, 2)
                ->nullable();

            // Cantidad contada físicamente al cerrar la caja.
            $table->decimal('monto_final_real', 12, 2)
                ->nullable();

            /*
             * Diferencia entre el monto real y el esperado.
             * Puede representar un sobrante o un faltante.
             */
            $table->decimal('diferencia', 12, 2)
                ->nullable();

            /*
             * Estados previstos:
             * - abierta
             * - cerrada
             */
            $table->string('estado', 20)
                ->default('abierta');

            // Momento exacto en que se realizó la apertura.
            $table->timestamp('abierta_en')
                ->useCurrent();

            // Momento exacto en que se realizó el cierre.
            $table->timestamp('cerrada_en')
                ->nullable();

            // Comentarios relacionados con la apertura o el cierre.
            $table->text('observaciones')
                ->nullable();

            // Fechas automáticas de creación y actualización.
            $table->timestamps();

            // Índices utilizados en búsquedas frecuentes.
            $table->index('estado');
            $table->index('abierta_en');
        });
    }

    /**
     * Elimina la tabla de cajas.
     */
    public function down(): void
    {
        Schema::dropIfExists('cajas');
    }
};