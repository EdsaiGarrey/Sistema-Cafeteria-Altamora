<?php

namespace App\Http\Requests\Producto;

use App\Models\Producto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductoRequest extends FormRequest
{
    /**
     * Los permisos se controlan mediante
     * Sanctum y los roles.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas para actualizar un producto.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $producto = $this->route('producto');

        $productoId = $producto instanceof Producto
            ? $producto->id
            : $producto;

        return [
            'categoria_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:categorias,id',
            ],

            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:120',

                Rule::unique(
                    'productos',
                    'nombre'
                )->ignore($productoId),
            ],

            'descripcion' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],

            'precio' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'imagen' => [
                'sometimes',
                'nullable',
                'url',
                'max:500',
            ],

            'activo' => [
                'sometimes',
                'required',
                'boolean',
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
            'categoria_id.required' =>
                'Debes seleccionar una categoría.',

            'categoria_id.exists' =>
                'La categoría seleccionada no existe.',

            'nombre.required' =>
                'El nombre del producto es obligatorio.',

            'nombre.max' =>
                'El nombre no puede superar los 120 caracteres.',

            'nombre.unique' =>
                'Ya existe otro producto con ese nombre.',

            'descripcion.max' =>
                'La descripción no puede superar los 1000 caracteres.',

            'precio.required' =>
                'El precio es obligatorio.',

            'precio.numeric' =>
                'El precio debe ser un número válido.',

            'precio.min' =>
                'El precio no puede ser negativo.',

            'imagen.url' =>
                'La imagen debe ser una dirección URL válida.',

            'imagen.max' =>
                'La dirección de la imagen es demasiado larga.',

            'activo.boolean' =>
                'El estado debe ser verdadero o falso.',
        ];
    }
}