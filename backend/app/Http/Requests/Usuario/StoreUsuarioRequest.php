<?php

namespace App\Http\Requests\Usuario;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUsuarioRequest extends FormRequest
{
    /**
     * La autorización principal se controla mediante
     * Sanctum y el middleware del rol administrador.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas para registrar un usuario desde
     * el módulo administrativo.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:120',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',

                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],

            'role' => [
                'required',
                'string',
                Rule::in(User::ROLES),
            ],
        ];
    }

    /**
     * Mensajes de validación mostrados debajo
     * de los campos del formulario en React.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' =>
                'El nombre es obligatorio.',

            'name.string' =>
                'El nombre debe contener texto válido.',

            'name.max' =>
                'El nombre no puede tener más de 120 caracteres.',

            'email.required' =>
                'El correo electrónico es obligatorio.',

            'email.string' =>
                'El correo electrónico debe contener texto válido.',

            'email.email' =>
                'Escribe un correo electrónico válido.',

            'email.max' =>
                'El correo electrónico no puede tener más de 255 caracteres.',

            'email.unique' =>
                'Este correo electrónico ya está registrado.',

            'password.required' =>
                'La contraseña es obligatoria.',

            'password.confirmed' =>
                'La confirmación de la contraseña no coincide.',

            'password.min' =>
                'La contraseña debe tener al menos 8 caracteres.',

            'password.mixed' =>
                'La contraseña debe contener una mayúscula y una minúscula.',

            'password.numbers' =>
                'La contraseña debe contener al menos un número.',

            'password.symbols' =>
                'La contraseña debe contener al menos un carácter especial.',

            'role.required' =>
                'El rol del usuario es obligatorio.',

            'role.string' =>
                'El rol seleccionado no es válido.',

            'role.in' =>
                'Selecciona un rol válido para el usuario.',
        ];
    }
}