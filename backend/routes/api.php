<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de la API de Altamora Café
|--------------------------------------------------------------------------
|
| Aquí se definirán los endpoints que serán consumidos por React.
|
*/

// Endpoint utilizado para comprobar que la API está funcionando.
Route::get('/estado', function () {
    return response()->json([
        'correcto' => true,
        'mensaje' => 'La API de Altamora Café funciona correctamente.',
        'aplicacion' => 'Altamora Café',
    ]);
});