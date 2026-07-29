<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Caja\AbrirCajaRequest;
use App\Http\Resources\CajaResource;
use App\Models\Caja;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CajaController extends Controller
{
    /**
     * Consulta la caja que se encuentra abierta.
     */
    public function activa(
        Request $request
    ): JsonResponse {
        $caja = Caja::query()
            ->with('usuarioApertura')
            ->where('estado', 'abierta')
            ->latest('abierta_en')
            ->first();

        return response()->json([
            'correcto' => true,

            'mensaje' => $caja
                ? 'La caja activa fue consultada correctamente.'
                : 'No existe una caja abierta.',

            'caja' => $caja
                ? (new CajaResource($caja))
                    ->resolve($request)
                : null,
        ]);
    }

    /**
     * Registra la apertura de una caja.
     */
    public function abrir(
        AbrirCajaRequest $request
    ): JsonResponse {
        /*
         * Solamente puede existir una caja abierta.
         */
        if (
            Caja::query()
                ->where('estado', 'abierta')
                ->exists()
        ) {
            return response()->json([
                'correcto' => false,

                'mensaje' =>
                    'Ya existe una caja abierta.',

                'errors' => [
                    'monto_inicial' => [
                        'Debes cerrar la caja actual antes de abrir otra.',
                    ],
                ],
            ], 422);
        }

        $caja = Caja::create([
            'usuario_apertura_id' =>
                $request->user()->id,

            'monto_inicial' =>
                $request->validated(
                    'monto_inicial'
                ),

            'estado' =>
                'abierta',

            'abierta_en' =>
                now(),
        ]);

        $caja->load('usuarioApertura');

        return response()->json([
            'correcto' => true,

            'mensaje' =>
                'La caja fue abierta correctamente.',

            'caja' =>
                (new CajaResource($caja))
                    ->resolve($request),
        ], 201);
    }
}