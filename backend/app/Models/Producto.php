<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    /** @use HasFactory<\Database\Factories\ProductoFactory> */
    use HasFactory;

    /**
     * Campos que se pueden registrar o actualizar.
     *
     * @var list<string>
     */
    protected $fillable = [
        'categoria_id',
        'nombre',
        'descripcion',
        'precio',
        'imagen',
        'activo',
    ];

    /**
     * Convierte los datos al tipo correcto.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /**
     * Categoría a la que pertenece el producto.
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

        /**
     * Detalles de pedidos donde aparece el producto.
     */
    public function detallesPedido(): HasMany
    {
        return $this->hasMany(DetallePedido::class);
    }
}