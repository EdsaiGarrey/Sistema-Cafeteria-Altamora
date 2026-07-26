<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Convierte al usuario en una respuesta
     * segura y organizada para React.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->name,
            'correo' => $this->email,
            'rol' => $this->role,

            'correo_verificado_en' =>
                $this->email_verified_at?->toISOString(),

            'creado_en' =>
                $this->created_at?->toISOString(),

            'actualizado_en' =>
                $this->updated_at?->toISOString(),
        ];
    }
}