<?php

namespace App\Http\Requests\Categoria;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoriaRequest extends FormRequest
{
    /**
     * La autorización principal se controla
     * mediante Sanctum y los roles.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepara automáticamente el slug
     * a partir del nombre recibido.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('nombre')) {
            $this->merge([
                'nombre' => trim(
                    (string) $this->input('nombre')
                ),

                'slug' => Str::slug(
                    (string) $this->input('nombre')
                ),
            ]);
        }

        if (!$this->has('activo')) {
            $this->merge([
                'activo' => true,
            ]);
        }
    }

    /**
     * Reglas para registrar una categoría.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                'unique:categorias,nombre',
            ],

            'slug' => [
                'required',
                'string',
                'max:140',
                'unique:categorias,slug',
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:1000',
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
            'nombre.required' =>
                'El nombre de la categoría es obligatorio.',

            'nombre.string' =>
                'El nombre debe contener texto válido.',

            'nombre.max' =>
                'El nombre no puede tener más de 120 caracteres.',

            'nombre.unique' =>
                'Ya existe una categoría con este nombre.',

            'slug.required' =>
                'No fue posible generar el identificador de la categoría.',

            'slug.string' =>
                'El identificador de la categoría no es válido.',

            'slug.max' =>
                'El identificador no puede tener más de 140 caracteres.',

            'slug.unique' =>
                'Ya existe una categoría con este identificador.',

            'descripcion.string' =>
                'La descripción debe contener texto válido.',

            'descripcion.max' =>
                'La descripción no puede tener más de 1000 caracteres.',

            'activo.required' =>
                'Debes indicar el estado de la categoría.',

            'activo.boolean' =>
                'El estado de la categoría debe ser verdadero o falso.',
        ];
    }
}