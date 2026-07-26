<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transforma la información del usuario en una respuesta JSON.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Identificador único del usuario.
            'id' => $this->id,

            // Nombre completo del usuario.
            'nombre' => $this->name,

            // Correo electrónico utilizado para iniciar sesión.
            'correo' => $this->email,

            // Fecha en la que se verificó el correo, si aplica.
            'correo_verificado_en' => $this->email_verified_at?->toISOString(),

            // Fecha de creación de la cuenta.
            'creado_en' => $this->created_at?->toISOString(),

            // Fecha de la última actualización de la cuenta.
            'actualizado_en' => $this->updated_at?->toISOString(),
        ];
    }
}