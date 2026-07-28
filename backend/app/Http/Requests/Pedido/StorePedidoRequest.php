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

        /*
         * El pedido debe incluir por lo menos
         * un producto.
         */
        'productos' => [
            'required',
            'array',
            'min:1',
        ],

        /*
         * Cada producto debe existir, estar activo
         * y no repetirse dentro del mismo pedido.
         */
        'productos.*.producto_id' => [
            'required',
            'integer',
            'distinct',

            Rule::exists(
                'productos',
                'id'
            )->where(
                fn ($consulta) =>
                    $consulta->where(
                        'activo',
                        true
                    )
            ),
        ],

        /*
         * La cantidad debe ser un número entero
         * mayor que cero.
         */
        'productos.*.cantidad' => [
            'required',
            'integer',
            'min:1',
            'max:100',
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

            'productos.required' =>
                'Debes agregar al menos un producto al pedido.',

            'productos.array' =>
                'La lista de productos no es válida.',

            'productos.min' =>
                'Debes agregar al menos un producto al pedido.',

            'productos.*.producto_id.required' =>
                'Debes seleccionar un producto.',

            'productos.*.producto_id.integer' =>
                'El producto seleccionado no es válido.',

            'productos.*.producto_id.distinct' =>
                'No puedes repetir un producto dentro del pedido.',

            'productos.*.producto_id.exists' =>
                'El producto seleccionado no existe o está inactivo.',

            'productos.*.cantidad.required' =>
                'Debes indicar la cantidad del producto.',

            'productos.*.cantidad.integer' =>
                'La cantidad debe ser un número entero.',

            'productos.*.cantidad.min' =>
                'La cantidad mínima es 1.',

            'productos.*.cantidad.max' =>
                'La cantidad máxima permitida es 100.',
        ];
    }
}