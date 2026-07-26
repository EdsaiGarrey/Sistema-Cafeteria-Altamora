<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Caja extends Model
{
    use HasFactory;

    /**
     * Campos que pueden asignarse de manera masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'usuario_apertura_id',
        'usuario_cierre_id',
        'monto_inicial',
        'monto_final_esperado',
        'monto_final_real',
        'diferencia',
        'estado',
        'abierta_en',
        'cerrada_en',
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
            'monto_inicial' => 'decimal:2',
            'monto_final_esperado' => 'decimal:2',
            'monto_final_real' => 'decimal:2',
            'diferencia' => 'decimal:2',
            'abierta_en' => 'datetime',
            'cerrada_en' => 'datetime',
        ];
    }

    /**
     * Obtiene al usuario que realizó la apertura.
     */
    public function usuarioApertura(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'usuario_apertura_id'
        );
    }

    /**
     * Obtiene al usuario que realizó el cierre.
     */
    public function usuarioCierre(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'usuario_cierre_id'
        );
    }

    /**
     * Obtiene todos los pedidos registrados en la caja.
     */
    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }
}