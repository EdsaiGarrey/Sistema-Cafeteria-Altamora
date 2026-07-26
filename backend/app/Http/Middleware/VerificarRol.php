<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerificarRol
{
    /**
     * Comprueba que el usuario autenticado tenga
     * alguno de los roles permitidos.
     *
     * @param Closure(Request): Response $next
     */
    public function handle(
        Request $request,
        Closure $next,
        string ...$roles
    ): Response {
        // Recuperamos al usuario autenticado con Sanctum.
        $usuario = $request->user();

        /*
         * Esta comprobación protege el middleware aunque
         * accidentalmente se utilice sin auth:sanctum.
         */
        if ($usuario === null) {
            return new JsonResponse([
                'correcto' => false,
                'mensaje' => 'Debes iniciar sesión para acceder a este recurso.',
            ], 401);
        }

        /*
         * Comprobamos si el rol actual se encuentra
         * dentro de la lista permitida para la ruta.
         */
        if (!$usuario->tieneRol(...$roles)) {
            return new JsonResponse([
                'correcto' => false,
                'mensaje' => 'No tienes permisos para acceder a este recurso.',
                'rol_actual' => $usuario->role,
                'roles_permitidos' => $roles,
            ], 403);
        }

        // El usuario tiene permiso y la petición continúa.
        return $next($request);
    }
}