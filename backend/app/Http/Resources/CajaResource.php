<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CajaResource extends JsonResource
{
    /**
     * Convierte la caja en una respuesta JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'monto_inicial' =>
                $this->monto_inicial,

            'estado' =>
                $this->estado,

            'abierta_en' =>
                $this->abierta_en?->toISOString(),

            'usuario_apertura' =>
                $this->whenLoaded(
                    'usuarioApertura',
                    fn () => [
                        'id' =>
                            $this->usuarioApertura?->id,

                        'nombre' =>
                            $this->usuarioApertura?->name,
                    ]
                ),
        ];
    }
}