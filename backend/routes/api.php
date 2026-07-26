<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PedidoController;
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
    /*
| Rutas temporales para comprobar los permisos por rol
|--------------------------------------------------------------------------
|
| Estas rutas permiten verificar las respuestas 200 y 403 antes
| de implementar los módulos administrativos definitivos.
|
*/

// Disponible para los tres roles del sistema.
Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente,empleado',
])->get('/autorizacion/operacion', function () {
    return response()->json([
        'correcto' => true,
        'mensaje' => 'Tienes acceso al área operativa.',
    ]);
});

// Disponible únicamente para administrador y gerente.
Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente',
])->get('/autorizacion/gestion', function () {
    return response()->json([
        'correcto' => true,
        'mensaje' => 'Tienes acceso al área de gestión.',
    ]);
});

// Disponible únicamente para el administrador.
Route::middleware([
    'auth:sanctum',
    'rol:administrador',
])->get('/autorizacion/administracion', function () {
    return response()->json([
        'correcto' => true,
        'mensaje' => 'Tienes acceso al área administrativa.',
    ]);
});


/*
|--------------------------------------------------------------------------
| Rutas protegidas del módulo de pedidos
|--------------------------------------------------------------------------
|
| Estas rutas requieren un token válido de Laravel Sanctum.
|
*/

Route::middleware('auth:sanctum')
    ->apiResource(
        'pedidos',
        PedidoController::class
    )
    ->only([
        'index',
        'store',
        'show',
        'update',
    ]);