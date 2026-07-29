<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega al usuario que autorizó la cancelación del ticket.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->foreignId('cancelado_por_id')
                ->nullable()
                ->after('motivo_cancelacion')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Elimina la relación del usuario que autorizó la cancelación.
     */
    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropConstrainedForeignId(
                'cancelado_por_id'
            );
        });
    }
};