<?php

namespace App\Http\Requests\Pedido;

use Illuminate\Foundation\Http\FormRequest;

class CancelarPedidoRequest extends FormRequest
{
    /**
     * La autorización por rol se controla desde la ruta.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas para cancelar un ticket.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'motivo_cancelacion' => [
                'required',
                'string',
                'min:10',
                'max:500',
            ],
        ];
    }

    /**
     * Mensajes de validación en español.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'motivo_cancelacion.required' =>
                'Debes indicar el motivo de la cancelación.',

            'motivo_cancelacion.string' =>
                'El motivo de cancelación debe contener texto.',

            'motivo_cancelacion.min' =>
                'El motivo debe contener al menos 10 caracteres.',

            'motivo_cancelacion.max' =>
                'El motivo no puede superar 500 caracteres.',
        ];
    }
}