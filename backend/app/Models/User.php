<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Campos que pueden asignarse de manera masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * Campos que no deben mostrarse al convertir el usuario a JSON.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Define la conversión automática de algunos atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Convierte la fecha de verificación en un objeto de fecha.
            'email_verified_at' => 'datetime',

            // Hashea automáticamente la contraseña antes de guardarla.
            'password' => 'hashed',
        ];
    }
}