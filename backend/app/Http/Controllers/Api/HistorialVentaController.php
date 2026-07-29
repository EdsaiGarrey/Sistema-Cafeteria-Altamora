<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PedidoResource;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HistorialVentaController extends Controller
{
    /**
     * Consulta el historial de ventas con filtros y paginación.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        /*
         * Solamente se consideran ventas los pedidos
         * que tengan al menos un pago aprobado.
         */
        $consulta = Pedido::query()
            ->with([
                'caja',
                'usuario',
                'canceladoPor',

                'pagos' => function ($consultaPagos) {
                    $consultaPagos
                        ->where(
                            'estado',
                            'aprobado'
                        )
                        ->with('usuario')
                        ->orderBy('pagado_en');
                },

                'detalles.producto',
            ])
            ->withSum(
                [
                    'pagos as monto_pagado' =>
                        function ($consultaPagos) {
                            $consultaPagos->where(
                                'estado',
                                'aprobado'
                            );
                        },
                ],
                'monto'
            )
            ->whereHas(
                'pagos',
                function ($consultaPagos) {
                    $consultaPagos->where(
                        'estado',
                        'aprobado'
                    );
                }
            );

        /*
         * Busca por folio o nombre del cliente.
         */
        if ($request->filled('buscar')) {
            $buscar = trim(
                (string) $request->input('buscar')
            );

            $consulta->where(
                function ($subconsulta) use ($buscar) {
                    $subconsulta
                        ->where(
                            'folio',
                            'like',
                            "%{$buscar}%"
                        )
                        ->orWhere(
                            'cliente_nombre',
                            'like',
                            "%{$buscar}%"
                        );
                }
            );
        }

        /*
         * Filtra por estado del pedido.
         */
        if ($request->filled('estado')) {
            $consulta->where(
                'estado',
                $request->input('estado')
            );
        }

        /*
         * Filtra por método de pago.
         */
        if ($request->filled('metodo_pago')) {
            $metodoPago =
                $request->input('metodo_pago');

            $consulta->whereHas(
                'pagos',
                function (
                    $consultaPagos
                ) use ($metodoPago) {
                    $consultaPagos
                        ->where(
                            'estado',
                            'aprobado'
                        )
                        ->where(
                            'metodo_pago',
                            $metodoPago
                        );
                }
            );
        }

        /*
         * Filtra desde una fecha determinada.
         */
        if ($request->filled('fecha_desde')) {
            $consulta->whereDate(
                'pedido_en',
                '>=',
                $request->input('fecha_desde')
            );
        }

        /*
         * Filtra hasta una fecha determinada.
         */
        if ($request->filled('fecha_hasta')) {
            $consulta->whereDate(
                'pedido_en',
                '<=',
                $request->input('fecha_hasta')
            );
        }

        /*
         * Limita la cantidad de resultados por página.
         */
        $porPagina = max(
            1,
            min(
                $request->integer(
                    'por_pagina',
                    15
                ),
                100
            )
        );

        $ventas = $consulta
            ->orderByDesc('pedido_en')
            ->paginate($porPagina)
            ->withQueryString();

        return PedidoResource::collection(
            $ventas
        )->additional([
            'correcto' => true,

            'mensaje' =>
                'El historial de ventas fue consultado correctamente.',
        ]);
    }

    /**
     * Consulta el detalle completo de una venta.
     */
    public function show(
        Pedido $pedido
    ): JsonResponse {
        /*
         * Un pedido sin pagos aprobados todavía
         * no se considera una venta.
         */
        $tienePagoAprobado = $pedido
            ->pagos()
            ->where(
                'estado',
                'aprobado'
            )
            ->exists();

        if (!$tienePagoAprobado) {
            return response()->json([
                'correcto' => false,

                'mensaje' =>
                    'El pedido todavía no tiene una venta registrada.',
            ], 404);
        }

        $pedido->load([
            'caja',
            'usuario',
            'canceladoPor',

            'pagos' => function ($consultaPagos) {
                $consultaPagos
                    ->where(
                        'estado',
                        'aprobado'
                    )
                    ->with('usuario')
                    ->orderBy('pagado_en');
            },

            'detalles.producto',
        ]);

        /*
         * Calcula cuánto se pagó en total.
         */
        $pedido->setAttribute(
            'monto_pagado',
            (float) $pedido->pagos->sum('monto')
        );

        return response()->json([
            'correcto' => true,

            'mensaje' =>
                'La venta fue consultada correctamente.',

            'venta' =>
                (new PedidoResource($pedido))
                    ->resolve(),
        ]);
    }
}