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
            'monto_inicial' => $this->monto_inicial,
            'monto_final_esperado' =>
                $this->monto_final_esperado,
            'monto_final_real' =>
                $this->monto_final_real,
            'diferencia' => $this->diferencia,
            'estado' => $this->estado,
            'abierta_en' =>
                $this->abierta_en?->toISOString(),
            'cerrada_en' =>
                $this->cerrada_en?->toISOString(),
            'observaciones' =>
                $this->observaciones,

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

            'usuario_cierre' =>
                $this->whenLoaded(
                    'usuarioCierre',
                    fn () => [
                        'id' =>
                            $this->usuarioCierre?->id,
                        'nombre' =>
                            $this->usuarioCierre?->name,
                    ]
                ),
        ];
    }
}