<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega el rol a los usuarios existentes y futuros.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            /*
             * Todos los usuarios nuevos serán empleados
             * mientras un administrador no cambie su rol.
             */
            $table
                ->string('role', 20)
                ->default('empleado')
                ->after('password');
        });
    }

    /**
     * Elimina el campo role si se revierte la migración.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};