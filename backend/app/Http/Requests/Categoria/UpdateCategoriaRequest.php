<?php

namespace App\Http\Requests\Categoria;

use App\Models\Categoria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCategoriaRequest extends FormRequest
{
    /**
     * La autorización se controla mediante
     * Sanctum y el middleware de roles.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Actualiza el slug únicamente cuando
     * también se recibe un nombre nuevo.
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
    }

    /**
     * Reglas para actualizar una categoría.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $categoria = $this->route('categoria');

        $categoriaId = $categoria instanceof Categoria
            ? $categoria->id
            : $categoria;

        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:120',

                Rule::unique(
                    'categorias',
                    'nombre'
                )->ignore($categoriaId),
            ],

            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:140',

                Rule::unique(
                    'categorias',
                    'slug'
                )->ignore($categoriaId),
            ],

            'descripcion' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
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
            'nombre.required' =>
                'El nombre de la categoría es obligatorio.',

            'nombre.string' =>
                'El nombre debe contener texto válido.',

            'nombre.max' =>
                'El nombre no puede tener más de 120 caracteres.',

            'nombre.unique' =>
                'Ya existe otra categoría con este nombre.',

            'slug.required' =>
                'No fue posible generar el identificador de la categoría.',

            'slug.string' =>
                'El identificador de la categoría no es válido.',

            'slug.max' =>
                'El identificador no puede tener más de 140 caracteres.',

            'slug.unique' =>
                'Ya existe otra categoría con este identificador.',

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