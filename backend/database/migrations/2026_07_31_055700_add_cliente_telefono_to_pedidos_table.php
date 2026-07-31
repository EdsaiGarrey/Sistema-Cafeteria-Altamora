<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega el número de WhatsApp del cliente al pedido.
     */
    public function up(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table
                ->string('cliente_telefono', 20)
                ->nullable()
                ->after('cliente_nombre');
        });
    }

    /**
     * Elimina el teléfono si se revierte la migración.
     */
    public function down(): void
    {
        Schema::table('pedidos', function (Blueprint $table) {
            $table->dropColumn('cliente_telefono');
        });
    }
};