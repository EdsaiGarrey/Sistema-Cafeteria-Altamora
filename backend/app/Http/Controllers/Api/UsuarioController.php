<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Usuario\StoreUsuarioRequest;
use App\Http\Requests\Usuario\UpdateUsuarioRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UsuarioController extends Controller
{
    /**
     * Muestra los usuarios con búsqueda,
     * filtro por rol y paginación.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        $consulta = User::query();

        /*
         * Busca coincidencias dentro del nombre
         * o correo electrónico del usuario.
         */
        if ($request->filled('buscar')) {
            $buscar = trim(
                (string) $request->input('buscar')
            );

            $consulta->where(
                function ($subconsulta) use ($buscar) {
                    $subconsulta
                        ->where(
                            'name',
                            'like',
                            "%{$buscar}%"
                        )
                        ->orWhere(
                            'email',
                            'like',
                            "%{$buscar}%"
                        );
                }
            );
        }

        /*
         * Aplica el filtro solamente cuando el rol
         * recibido pertenece a los roles válidos.
         */
        if (
            $request->filled('role') &&
            in_array(
                $request->input('role'),
                User::ROLES,
                true
            )
        ) {
            $consulta->where(
                'role',
                $request->input('role')
            );
        }

        /*
         * Limita la consulta a un máximo
         * de 100 usuarios por página.
         */
        $porPagina = max(
            1,
            min(
                $request->integer(
                    'por_pagina',
                    10
                ),
                100
            )
        );

        $usuarios = $consulta
            ->orderBy('name')
            ->paginate($porPagina)
            ->withQueryString();

        return UserResource::collection(
            $usuarios
        )->additional([
            'correcto' => true,
            'mensaje' =>
                'Los usuarios fueron consultados correctamente.',
        ]);
    }

    /**
     * Registra un usuario nuevo desde
     * el área administrativa.
     */
    public function store(
        StoreUsuarioRequest $request
    ): JsonResponse {
        $usuario = User::create(
            $request->validated()
        );

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El usuario fue registrado correctamente.',

            'usuario' =>
                (new UserResource($usuario))
                    ->resolve($request),
        ], 201);
    }

    /**
     * Muestra la información de un
     * usuario específico.
     */
    public function show(
        User $usuario
    ): JsonResponse {
        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El usuario fue consultado correctamente.',

            'usuario' =>
                (new UserResource($usuario))
                    ->resolve(),
        ]);
    }

    /**
     * Actualiza los datos de un usuario.
     */
    public function update(
        UpdateUsuarioRequest $request,
        User $usuario
    ): JsonResponse {
        $datos = $request->validated();

        /*
         * Un administrador no puede quitarse
         * a sí mismo el rol de administrador.
         */
        if (
            $request->user()->is($usuario) &&
            isset($datos['role']) &&
            $datos['role'] !== User::ROL_ADMINISTRADOR
        ) {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No puedes quitarte tu propio rol de administrador.',

                'errors' => [
                    'role' => [
                        'Tu cuenta debe conservar el rol de administrador.',
                    ],
                ],
            ], 422);
        }

        /*
         * Evita que el sistema se quede
         * sin ningún administrador.
         */
        if (
            $usuario->esAdministrador() &&
            isset($datos['role']) &&
            $datos['role'] !== User::ROL_ADMINISTRADOR &&
            $this->esUltimoAdministrador($usuario)
        ) {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No puedes cambiar el rol del último administrador.',

                'errors' => [
                    'role' => [
                        'El sistema debe conservar al menos un administrador.',
                    ],
                ],
            ], 422);
        }

        /*
         * Cuando la contraseña queda vacía,
         * se conserva la contraseña actual.
         */
        if (
            array_key_exists('password', $datos) &&
            blank($datos['password'])
        ) {
            unset($datos['password']);
        }

        $usuario->fill($datos);
        $usuario->save();

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El usuario fue actualizado correctamente.',

            'usuario' =>
                (new UserResource($usuario->fresh()))
                    ->resolve($request),
        ]);
    }

    /**
     * Elimina un usuario del sistema.
     */
    public function destroy(
        Request $request,
        User $usuario
    ): JsonResponse {
        /*
         * El administrador autenticado no puede
         * eliminar su propia cuenta.
         */
        if ($request->user()->is($usuario)) {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No puedes eliminar tu propia cuenta.',
            ], 422);
        }

        /*
         * Impide eliminar al último administrador.
         */
        if ($this->esUltimoAdministrador($usuario)) {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No puedes eliminar al último administrador.',
            ], 422);
        }

        /*
         * Elimina los tokens del usuario antes
         * de borrar definitivamente su cuenta.
         */
        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El usuario fue eliminado correctamente.',
        ]);
    }

    /**
     * Comprueba si el usuario recibido es
     * el único administrador del sistema.
     */
    private function esUltimoAdministrador(
        User $usuario
    ): bool {
        if (!$usuario->esAdministrador()) {
            return false;
        }

        return User::query()
            ->where(
                'role',
                User::ROL_ADMINISTRADOR
            )
            ->count() <= 1;
    }
}