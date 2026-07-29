<?php

namespace App\Http\Requests\Caja;

use Illuminate\Foundation\Http\FormRequest;

class AbrirCajaRequest extends FormRequest
{
    /**
     * Permite validar la apertura de caja.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Valida el monto inicial.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'monto_inicial' => [
                'required',
                'numeric',
                'min:0',
                'max:999999.99',
            ],
        ];
    }

    /**
     * Mensajes visibles debajo del campo.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'monto_inicial.required' =>
                'Debes indicar el monto inicial.',

            'monto_inicial.numeric' =>
                'El monto inicial debe ser un número válido.',

            'monto_inicial.min' =>
                'El monto inicial no puede ser negativo.',

            'monto_inicial.max' =>
                'El monto inicial es demasiado alto.',
        ];
    }
}