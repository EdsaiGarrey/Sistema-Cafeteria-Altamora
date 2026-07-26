<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API de Altamora Café
|--------------------------------------------------------------------------
|
| Aquí se registran los endpoints que serán consumidos por React.
| Las rutas públicas no requieren autenticación, mientras que las
| rutas protegidas necesitan un token válido de Laravel Sanctum.
|
*/

// Ruta utilizada para comprobar que la API está funcionando.
Route::get('/estado', function () {
    return response()->json([
        'correcto' => true,
        'mensaje' => 'La API de Altamora Café funciona correctamente.',
        'aplicacion' => 'Altamora Café',
    ]);
});

/*
|--------------------------------------------------------------------------
| Rutas públicas de autenticación
|--------------------------------------------------------------------------
|
| Estas rutas pueden utilizarse sin haber iniciado sesión.
|
*/
Route::prefix('autenticacion')->group(function () {
    // Registrar una cuenta nueva.
    Route::post('/registro', [
        AuthController::class,
        'registrar',
    ]);

    // Iniciar sesión y generar un token.
    Route::post('/inicio-sesion', [
        AuthController::class,
        'iniciarSesion',
    ]);

    // Solicitar el enlace de recuperación de contraseña.
    Route::post('/recuperar-contrasena', [
        AuthController::class,
        'solicitarRecuperacion',
    ]);

    // Restablecer la contraseña utilizando el token recibido.
    Route::post('/restablecer-contrasena', [
        AuthController::class,
        'restablecerContrasena',
    ]);
});

/*
|--------------------------------------------------------------------------
| Rutas protegidas de autenticación
|--------------------------------------------------------------------------
|
| Estas rutas requieren enviar un token Bearer válido en la petición.
|
*/
Route::middleware('auth:sanctum')
    ->prefix('autenticacion')
    ->group(function () {
        // Consultar los datos del usuario autenticado.
        Route::get('/perfil', [
            AuthController::class,
            'perfil',
        ]);

        // Cerrar la sesión y eliminar el token actual.
        Route::post('/cerrar-sesion', [
            AuthController::class,
            'cerrarSesion',
        ]);
    });