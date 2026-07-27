<?php

namespace App\Http\Requests\Producto;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductoRequest extends FormRequest
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
     * Coloca el producto como activo
     * cuando no se envía ese campo.
     */
    protected function prepareForValidation(): void
    {
        if (!$this->has('activo')) {
            $this->merge([
                'activo' => true,
            ]);
        }
    }

    /**
     * Reglas para registrar un producto.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'categoria_id' => [
                'required',
                'integer',
                'exists:categorias,id',
            ],

            'nombre' => [
                'required',
                'string',
                'max:120',
                'unique:productos,nombre',
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'precio' => [
                'required',
                'numeric',
                'min:0',
            ],

            'imagen' => [
                'nullable',
                'url',
                'max:500',
            ],

            'activo' => [
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
                'Ya existe un producto con ese nombre.',

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