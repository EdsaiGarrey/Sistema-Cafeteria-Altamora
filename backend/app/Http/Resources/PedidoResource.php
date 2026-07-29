<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoResource extends JsonResource
{
    /**
     * Convierte un pedido en una respuesta JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'folio' => $this->folio,

            'caja' => [
                'id' => $this->caja?->id,
                'estado' => $this->caja?->estado,
            ],

            'usuario' => [
                'id' => $this->usuario?->id,
                'nombre' => $this->usuario?->name,
                'correo' => $this->usuario?->email,
            ],

            'cliente_nombre' => $this->cliente_nombre,
            'tipo_servicio' => $this->tipo_servicio,
            'estado' => $this->estado,

            'motivo_cancelacion' =>$this->motivo_cancelacion,

            'cancelado_por' =>$this->whenLoaded(
                    'canceladoPor',
                    function () {
                        return [
                            'id' =>
                                $this->canceladoPor?->id,

                            'nombre' =>
                                $this->canceladoPor?->name,

                            'correo' =>
                                $this->canceladoPor?->email,
                        ];
                    }
                ),

            'subtotal' => $this->subtotal,
            'descuento' => $this->descuento,
            'impuestos' => $this->impuestos,
            'total' => $this->total,

            /*
            * Productos y cantidades incluidos
            * dentro del pedido.
            */
            'productos' =>
                DetallePedidoResource::collection(
                    $this->whenLoaded('detalles')
                ),

            'notas' => $this->notas,

            'pedido_en' =>
                $this->pedido_en?->toISOString(),

            'completado_en' =>
                $this->completado_en?->toISOString(),

            'cancelado_en' =>
                $this->cancelado_en?->toISOString(),

            'creado_en' =>
                $this->created_at?->toISOString(),

            'actualizado_en' =>
                $this->updated_at?->toISOString(),
        ];
    }
}