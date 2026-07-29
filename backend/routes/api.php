<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CajaController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VerificacionCorreoController;
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

    // Verificar el correo mediante el enlace firmado.
    Route::get(
        '/verificar-correo/{id}/{hash}',
        [
            VerificacionCorreoController::class,
            'verificar',
        ]
    )->middleware([
        'signed',
        'throttle:6,1',
    ])->name('verification.verify');
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

        // Reenviar el enlace de verificación del correo.
        Route::post(
            '/reenviar-verificacion-correo',
            [
                VerificacionCorreoController::class,
                'reenviar',
            ]
        )->middleware(
            'throttle:6,1'
        )->name('verification.send');
    });

/*
|--------------------------------------------------------------------------
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

/*
|--------------------------------------------------------------------------
| Rutas protegidas del módulo de pagos
|--------------------------------------------------------------------------
|
| Los usuarios autenticados pueden consultar y registrar pagos
| relacionados con los pedidos de la cafetería.
|
*/

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente,empleado',
])->apiResource(
    'pagos',
    PagoController::class
)->only([
    'index',
    'store',
    'show',
]);

/*
|--------------------------------------------------------------------------
| Rutas del módulo de caja
|--------------------------------------------------------------------------
|
| Todos los usuarios autorizados pueden consultar la caja activa.
| Solo el administrador y el gerente pueden abrir o cerrar la caja.
|
*/

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente,empleado',
])->get(
    'cajas/activa',
    [
        CajaController::class,
        'activa',
    ]
);

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente',
])->post(
    'cajas/abrir',
    [
        CajaController::class,
        'abrir',
    ]
);

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente',
])->post(
    'cajas/cerrar',
    [
        CajaController::class,
        'cerrar',
    ]
);

/*
|--------------------------------------------------------------------------
| Rutas protegidas del módulo de usuarios
|--------------------------------------------------------------------------
|
| Solo un administrador autenticado puede consultar, registrar,
| editar o eliminar usuarios.
|
*/

Route::middleware([
    'auth:sanctum',
    'rol:administrador',
])->apiResource(
    'usuarios',
    UsuarioController::class
);

/*
|--------------------------------------------------------------------------
| Rutas protegidas del módulo de categorías
|--------------------------------------------------------------------------
|
| El administrador y el gerente pueden administrar categorías.
|
*/

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente',
])->apiResource(
    'categorias',
    CategoriaController::class
);

/*
|--------------------------------------------------------------------------
| Productos disponibles para pedidos
|--------------------------------------------------------------------------
|
| Los tres roles pueden consultar productos activos, pero únicamente
| el administrador y el gerente pueden administrarlos.
|
*/

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente,empleado',
])->get('/productos-disponibles', [
    ProductoController::class,
    'disponibles',
]);

/*
|--------------------------------------------------------------------------
| Rutas protegidas del módulo de productos
|--------------------------------------------------------------------------
|
| El administrador y el gerente pueden administrar productos.
|
*/

Route::middleware([
    'auth:sanctum',
    'rol:administrador,gerente',
])->apiResource(
    'productos',
    ProductoController::class
);