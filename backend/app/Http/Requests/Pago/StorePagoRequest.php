<?php

namespace App\Http\Requests\Pago;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePagoRequest extends FormRequest
{
    /**
     * Permite registrar pagos a usuarios autenticados.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas para registrar el pago de un pedido.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pedido_id' => [
                'required',
                'integer',
                'exists:pedidos,id',
            ],

            'metodo_pago' => [
                'required',
                'string',

                Rule::in([
                    'efectivo',
                    'tarjeta',
                    'transferencia',
                    'otro',
                ]),
            ],

            'monto' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            /*
             * En efectivo es obligatorio indicar
             * cuánto dinero entregó el cliente.
             */
            'monto_recibido' => [
                'required_if:metodo_pago,efectivo',
                'nullable',
                'numeric',
                'gte:monto',
            ],

            /*
             * La referencia es obligatoria para
             * tarjeta y transferencia.
             */
            'referencia' => [
                Rule::requiredIf(
                    fn (): bool => in_array(
                        $this->input('metodo_pago'),
                        [
                            'tarjeta',
                            'transferencia',
                        ],
                        true
                    )
                ),

                'nullable',
                'string',
                'max:120',
            ],

            'observaciones' => [
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
            'pedido_id.required' =>
                'Debes seleccionar un pedido.',

            'pedido_id.integer' =>
                'El pedido seleccionado no es válido.',

            'pedido_id.exists' =>
                'El pedido seleccionado no existe.',

            'metodo_pago.required' =>
                'Debes seleccionar un método de pago.',

            'metodo_pago.in' =>
                'El método de pago seleccionado no es válido.',

            'monto.required' =>
                'Debes indicar el monto del pago.',

            'monto.numeric' =>
                'El monto debe ser un número válido.',

            'monto.min' =>
                'El monto debe ser mayor que cero.',

            'monto_recibido.required_if' =>
                'Indica cuánto dinero entregó el cliente.',

            'monto_recibido.numeric' =>
                'El monto recibido debe ser un número válido.',

            'monto_recibido.gte' =>
                'El monto recibido no puede ser menor al pago.',

            'referencia.required' =>
                'Debes escribir la referencia del pago.',

            'referencia.max' =>
                'La referencia no puede superar 120 caracteres.',

            'observaciones.max' =>
                'Las observaciones no pueden superar 1000 caracteres.',
        ];
    }
}