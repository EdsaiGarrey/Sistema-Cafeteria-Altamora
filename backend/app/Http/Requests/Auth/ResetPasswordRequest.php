<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    /**
     * Permite que cualquier visitante con un token válido
     * intente restablecer su contraseña.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normaliza el correo electrónico antes de validarlo.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            // Elimina espacios y convierte el correo a minúsculas.
            'email' => strtolower(trim((string) $this->email)),
        ]);
    }

    /**
     * Define las reglas para restablecer la contraseña.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Token enviado mediante el enlace de recuperación.
            'token' => [
                'required',
                'string',
            ],

            // Correo electrónico asociado con la cuenta.
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],

            /*
             * La nueva contraseña debe:
             * - Tener al menos 8 caracteres.
             * - Contener mayúsculas y minúsculas.
             * - Incluir al menos un número.
             * - Incluir al menos un carácter especial.
             * - Coincidir con password_confirmation.
             */
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
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
            'token.required' => 'El token de recuperación es obligatorio.',
            'token.string' => 'El token de recuperación no es válido.',

            'email.required' => 'El correo electrónico es obligatorio.',
            'email.string' => 'El correo electrónico debe contener texto válido.',
            'email.email' => 'Escribe un correo electrónico válido.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',

            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed' => 'La contraseña debe contener una mayúscula y una minúscula.',
            'password.numbers' => 'La contraseña debe contener al menos un número.',
            'password.symbols' => 'La contraseña debe contener al menos un carácter especial.',
        ];
    }
}