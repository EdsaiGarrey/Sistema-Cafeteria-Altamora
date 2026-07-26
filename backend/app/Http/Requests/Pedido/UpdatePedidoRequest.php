<?php

namespace App\Http\Requests\Pedido;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePedidoRequest extends FormRequest
{
    /**
     * Permite modificar pedidos a usuarios autenticados.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas para actualizar un pedido.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'cliente_nombre' => [
                'sometimes',
                'nullable',
                'string',
                'max:120',
            ],

            'tipo_servicio' => [
                'sometimes',
                Rule::in([
                    'local',
                    'llevar',
                    'domicilio',
                ]),
            ],

            'estado' => [
                'sometimes',
                Rule::in([
                    'pendiente',
                    'confirmado',
                    'en_preparacion',
                    'listo',
                    'entregado',
                ]),
            ],

            'notas' => [
                'sometimes',
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
            'cliente_nombre.string' =>
                'El nombre del cliente debe contener texto.',

            'cliente_nombre.max' =>
                'El nombre del cliente no puede superar 120 caracteres.',

            'tipo_servicio.in' =>
                'El tipo de servicio debe ser local, llevar o domicilio.',

            'estado.in' =>
                'El estado seleccionado no es válido.',

            'notas.string' =>
                'Las notas deben contener texto.',

            'notas.max' =>
                'Las notas no pueden superar 1000 caracteres.',
        ];
    }
}