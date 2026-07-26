<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Permite que cualquier visitante intente iniciar sesión.
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
     * Define las reglas de validación para iniciar sesión.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // El correo es el identificador de acceso del usuario.
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],

            /*
             * En el inicio de sesión solamente comprobamos que la contraseña
             * haya sido enviada. La seguridad y complejidad se validan al
             * registrar o restablecer una contraseña.
             */
            'password' => [
                'required',
                'string',
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
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.string' => 'El correo electrónico debe contener texto válido.',
            'email.email' => 'Escribe un correo electrónico válido.',
            'email.max' => 'El correo electrónico no puede tener más de 255 caracteres.',

            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe contener texto válido.',
        ];
    }
}