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

    /*
     * Roles disponibles dentro del sistema Altamora Café.
     */
    public const ROL_ADMINISTRADOR = 'administrador';

    public const ROL_GERENTE = 'gerente';

    public const ROL_EMPLEADO = 'empleado';

    /**
     * Lista de roles válidos del sistema.
     *
     * @var list<string>
     */
    public const ROLES = [
        self::ROL_ADMINISTRADOR,
        self::ROL_GERENTE,
        self::ROL_EMPLEADO,
    ];

    /**
     * Campos que pueden asignarse de manera masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * Campos que no deben mostrarse al convertir
     * al usuario en una respuesta JSON.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Define la conversión automática de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // Convierte la fecha de verificación.
            'email_verified_at' => 'datetime',

            // Hashea automáticamente la contraseña.
            'password' => 'hashed',
        ];
    }

    /**
     * Comprueba si el usuario posee alguno
     * de los roles recibidos.
     */
    public function tieneRol(string ...$roles): bool
    {
        return in_array(
            $this->role,
            $roles,
            true
        );
    }

    /**
     * Comprueba si el usuario es administrador.
     */
    public function esAdministrador(): bool
    {
        return $this->tieneRol(
            self::ROL_ADMINISTRADOR
        );
    }

    /**
     * Comprueba si el usuario es gerente.
     */
    public function esGerente(): bool
    {
        return $this->tieneRol(
            self::ROL_GERENTE
        );
    }

    /**
     * Comprueba si el usuario es empleado.
     */
    public function esEmpleado(): bool
    {
        return $this->tieneRol(
            self::ROL_EMPLEADO
        );
    }
}