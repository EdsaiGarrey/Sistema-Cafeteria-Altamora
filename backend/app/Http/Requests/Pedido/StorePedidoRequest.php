<?php

namespace App\Http\Requests\Pedido;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePedidoRequest extends FormRequest
{
    /**
     * Permite crear pedidos a usuarios autenticados.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas para registrar un pedido nuevo.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'caja_id' => [
                'required',
                'integer',
                'exists:cajas,id',
            ],

            'cliente_nombre' => [
                'nullable',
                'string',
                'max:120',
            ],

            'tipo_servicio' => [
                'required',
                Rule::in([
                    'local',
                    'llevar',
                    'domicilio',
                ]),
            ],

            'notas' => [
                'nullable',
                'string',
                'max:1000',
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
            'caja_id.required' =>
                'Debes seleccionar una caja.',

            'caja_id.integer' =>
                'La caja seleccionada no es válida.',

            'caja_id.exists' =>
                'La caja seleccionada no existe.',

            'cliente_nombre.string' =>
                'El nombre del cliente debe contener texto.',

            'cliente_nombre.max' =>
                'El nombre del cliente no puede superar 120 caracteres.',

            'tipo_servicio.required' =>
                'Debes seleccionar el tipo de servicio.',

            'tipo_servicio.in' =>
                'El tipo de servicio debe ser local, llevar o domicilio.',

            'notas.string' =>
                'Las notas deben contener texto.',

            'notas.max' =>
                'Las notas no pueden superar 1000 caracteres.',
        ];
    }
}