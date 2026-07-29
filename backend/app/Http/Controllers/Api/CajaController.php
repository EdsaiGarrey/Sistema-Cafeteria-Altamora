<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Caja\AbrirCajaRequest;
use App\Http\Requests\Caja\CerrarCajaRequest;
use App\Http\Resources\CajaResource;
use App\Models\Caja;
use App\Models\Pago;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CajaController extends Controller
{
    /**
     * Consulta la caja abierta y sus ventas.
     */
    public function activa(
        Request $request
    ): JsonResponse {
        $caja = Caja::query()
            ->with([
                'usuarioApertura',
                'usuarioCierre',
            ])
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

            'resumen' => $caja
                ? $this->crearResumen($caja)
                : null,
        ]);
    }

    /**
     * Registra la apertura de una caja.
     */
    public function abrir(
        AbrirCajaRequest $request
    ): JsonResponse {
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

            'estado' => 'abierta',
            'abierta_en' => now(),
        ]);

        $caja->load([
            'usuarioApertura',
            'usuarioCierre',
        ]);

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'La caja fue abierta correctamente.',

            'caja' =>
                (new CajaResource($caja))
                    ->resolve($request),

            'resumen' =>
                $this->crearResumen($caja),
        ], 201);
    }

    /**
     * Realiza el corte y cierra la caja.
     */
    public function cerrar(
        CerrarCajaRequest $request
    ): JsonResponse {
        $caja = Caja::query()
            ->where('estado', 'abierta')
            ->latest('abierta_en')
            ->first();

        if (!$caja) {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No existe una caja abierta.',
            ], 422);
        }

        $resumen =
            $this->crearResumen($caja);

        $montoReal = (float)
            $request->validated(
                'monto_final_real'
            );

        $montoEsperado = (float)
            $resumen['efectivo_esperado'];

        $caja->update([
            'usuario_cierre_id' =>
                $request->user()->id,

            'monto_final_esperado' =>
                $montoEsperado,

            'monto_final_real' =>
                $montoReal,

            'diferencia' =>
                $montoReal - $montoEsperado,

            'estado' => 'cerrada',
            'cerrada_en' => now(),

            'observaciones' =>
                $request->validated(
                    'observaciones'
                ),
        ]);

        $caja->load([
            'usuarioApertura',
            'usuarioCierre',
        ]);

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El corte de caja se realizo correctamente.',

            'caja' =>
                (new CajaResource($caja))
                    ->resolve($request),

            'resumen' => $resumen,
        ]);
    }

    /**
     * Calcula las ventas de la caja
     * utilizando los pagos aprobados.
     *
     * @return array<string, float>
     */
    private function crearResumen(
        Caja $caja
    ): array {
        $totales = Pago::query()
            ->where('estado', 'aprobado')
            ->whereHas(
                'pedido',
                function ($consulta) use ($caja) {
                    $consulta->where(
                        'caja_id',
                        $caja->id
                    );
                }
            )
            ->selectRaw(
                'metodo_pago, SUM(monto) as total'
            )
            ->groupBy('metodo_pago')
            ->pluck(
                'total',
                'metodo_pago'
            );

        $efectivo = (float)
            ($totales['efectivo'] ?? 0);

        $tarjeta = (float)
            ($totales['tarjeta'] ?? 0);

        $transferencia = (float)
            ($totales['transferencia'] ?? 0);

        $otros = (float)
            ($totales['otro'] ?? 0);

        return [
            'ventas_efectivo' => $efectivo,
            'ventas_tarjeta' => $tarjeta,
            'ventas_transferencia' =>
                $transferencia,
            'ventas_otro' => $otros,

            'total_vendido' =>
                $efectivo +
                $tarjeta +
                $transferencia +
                $otros,

            'efectivo_esperado' =>
                (float) $caja->monto_inicial +
                $efectivo,
        ];
    }
}