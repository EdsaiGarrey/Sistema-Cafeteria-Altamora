<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pedido extends Model
{
    use HasFactory;

    /**
     * Campos que pueden asignarse de manera masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'folio',
        'caja_id',
        'usuario_id',
        'cliente_nombre',
        'tipo_servicio',
        'estado',
        'subtotal',
        'descuento',
        'impuestos',
        'total',
        'notas',
        'pedido_en',
        'completado_en',
        'cancelado_en',
        'motivo_cancelacion',
    ];

    /**
     * Convierte automáticamente montos y fechas.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'descuento' => 'decimal:2',
            'impuestos' => 'decimal:2',
            'total' => 'decimal:2',
            'pedido_en' => 'datetime',
            'completado_en' => 'datetime',
            'cancelado_en' => 'datetime',
        ];
    }

    /**
     * Obtiene la caja en la que fue registrado el pedido.
     */
    public function caja(): BelongsTo
    {
        return $this->belongsTo(Caja::class);
    }

    /**
     * Obtiene al usuario que registró el pedido.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obtiene todos los pagos realizados sobre el pedido.
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }

        /**
     * Obtiene los productos y cantidades del pedido.
     */
    public function detalles(): HasMany
    {
        return $this->hasMany(DetallePedido::class);
    }

}