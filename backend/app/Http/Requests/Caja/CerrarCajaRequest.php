<?php

namespace App\Http\Requests\Caja;

use Illuminate\Foundation\Http\FormRequest;

class CerrarCajaRequest extends FormRequest
{
    /**
     * Los permisos se controlan en las rutas.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Valida los datos del corte.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'monto_final_real' => [
                'required',
                'numeric',
                'min:0',
                'max:999999.99',
            ],

            'observaciones' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Mensajes visibles en el formulario.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'monto_final_real.required' =>
                'Debes indicar el efectivo contado.',

            'monto_final_real.numeric' =>
                'El efectivo contado debe ser un numero valido.',

            'monto_final_real.min' =>
                'El efectivo contado no puede ser negativo.',

            'monto_final_real.max' =>
                'El efectivo contado es demasiado alto.',

            'observaciones.max' =>
                'Las observaciones no pueden superar 500 caracteres.',
        ];
    }
}