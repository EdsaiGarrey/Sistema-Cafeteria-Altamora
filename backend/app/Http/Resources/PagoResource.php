<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PagoResource extends JsonResource
{
    /**
     * Convierte el pago en una respuesta JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request
    ): array {
        return [
            'id' =>
                $this->id,

            'metodo_pago' =>
                $this->metodo_pago,

            'monto' =>
                $this->monto,

            'monto_recibido' =>
                $this->monto_recibido,

            'cambio' =>
                $this->cambio,

            'referencia' =>
                $this->referencia,

            'estado' =>
                $this->estado,

            'pagado_en' =>
                $this->pagado_en?->toISOString(),

            'observaciones' =>
                $this->observaciones,

            'pedido' => $this->whenLoaded(
                'pedido',
                fn (): array => [
                    'id' =>
                        $this->pedido->id,

                    'folio' =>
                        $this->pedido->folio,

                    'cliente_nombre' =>
                        $this->pedido->cliente_nombre,

                    'total' =>
                        $this->pedido->total,

                    'estado' =>
                        $this->pedido->estado,
                ]
            ),

            'usuario' => $this->whenLoaded(
                'usuario',
                fn (): array => [
                    'id' =>
                        $this->usuario->id,

                    'nombre' =>
                        $this->usuario->name,

                    'email' =>
                        $this->usuario->email,
                ]
            ),

            'creado_en' =>
                $this->created_at?->toISOString(),

            'actualizado_en' =>
                $this->updated_at?->toISOString(),
        ];
    }
}