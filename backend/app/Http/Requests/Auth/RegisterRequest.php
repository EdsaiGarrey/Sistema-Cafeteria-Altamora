<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determina si cualquier visitante puede realizar el registro.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Define las reglas de validación para registrar un usuario.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // El nombre debe ser obligatorio y tener un máximo de 120 caracteres.
            'name' => [
                'required',
                'string',
                'max:120',
            ],

            // El correo debe ser válido y no puede repetirse en la tabla users.
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            /*
             * La contraseña debe tener:
             * - Mínimo 8 caracteres.
             * - Una letra mayúscula y una minúscula.
             * - Al menos un número.
             * - Al menos un carácter especial.
             * - Confirmación mediante password_confirmation.
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
     * Personaliza los mensajes de validación en español.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe contener texto válido.',
            'name.max' => 'El nombre no puede tener más de 120 caracteres.',

            'email.required' => 'El correo electrónico es obligatorio.',
            'email.string' => 'El correo electrónico debe contener texto válido.',
            'email.email' => 'Escribe un correo electrónico válido.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',
            'email.unique' => 'Este correo electrónico ya está registrado.',

            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.mixed' => 'La contraseña debe contener una mayúscula y una minúscula.',
            'password.numbers' => 'La contraseña debe contener al menos un número.',
            'password.symbols' => 'La contraseña debe contener al menos un carácter especial.',
        ];
    }
}