<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    /**
     * Permite que cualquier visitante solicite recuperar su contraseña.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normaliza el correo antes de realizar la validación.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            // Elimina espacios y convierte el correo electrónico a minúsculas.
            'email' => strtolower(trim((string) $this->email)),
        ]);
    }

    /**
     * Define las reglas para solicitar el enlace de recuperación.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // El usuario debe proporcionar un correo electrónico válido.
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],
        ];
    }

    /**
     * Define los mensajes de validación en español.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.string' => 'El correo electrónico debe contener texto válido.',
            'email.email' => 'Escribe un correo electrónico válido.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',
        ];
    }
}