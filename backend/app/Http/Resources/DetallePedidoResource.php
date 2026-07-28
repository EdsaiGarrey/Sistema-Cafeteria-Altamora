<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetallePedidoResource extends JsonResource
{
    /**
     * Convierte un detalle del pedido
     * en una respuesta JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'producto' => [
                'id' => $this->producto?->id,
                'nombre' => $this->producto?->nombre,
                'precio_actual' => $this->producto?->precio,
                'activo' => $this->producto?->activo,
            ],

            'cantidad' => $this->cantidad,
            'precio_unitario' => $this->precio_unitario,
            'subtotal' => $this->subtotal,
        ];
    }
}