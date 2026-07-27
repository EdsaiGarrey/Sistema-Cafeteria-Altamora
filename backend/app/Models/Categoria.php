<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    /** @use HasFactory<\Database\Factories\CategoriaFactory> */
    use HasFactory;

    /**
     * Campos permitidos para asignación masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'slug',
        'descripcion',
        'activo',
    ];

    /**
     * Convierte automáticamente algunos
     * valores obtenidos de la base de datos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }
}