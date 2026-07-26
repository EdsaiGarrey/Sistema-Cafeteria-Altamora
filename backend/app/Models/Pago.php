<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    use HasFactory;

    /**
     * Campos que pueden asignarse de manera masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pedido_id',
        'usuario_id',
        'metodo_pago',
        'monto',
        'monto_recibido',
        'cambio',
        'referencia',
        'estado',
        'pagado_en',
        'observaciones',
    ];

    /**
     * Convierte automáticamente montos y fechas.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'monto_recibido' => 'decimal:2',
            'cambio' => 'decimal:2',
            'pagado_en' => 'datetime',
        ];
    }

    /**
     * Obtiene el pedido al que pertenece el pago.
     */
    public function pedido(): BelongsTo
    {
        return $this->belongsTo(Pedido::class);
    }

    /**
     * Obtiene al usuario que registró el pago.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}