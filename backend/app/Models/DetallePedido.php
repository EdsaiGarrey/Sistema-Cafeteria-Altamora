<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetallePedido extends Model
{
    use HasFactory;

    /**
     * Campos que pueden registrarse de manera masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pedido_id',
        'producto_id',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    /**
     * Convierte los valores numéricos al tipo adecuado.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cantidad' => 'integer',
            'precio_unitario' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * Pedido al que pertenece este detalle.
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    /**
     * Producto incluido en el pedido.
     */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}