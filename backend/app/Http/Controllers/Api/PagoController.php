<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pago\StorePagoRequest;
use App\Http\Resources\PagoResource;
use App\Models\Pago;
use App\Models\Pedido;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PagoController extends Controller
{

    /**
     * Servicio encargado de enviar mensajes por WhatsApp.
     */
    public function __construct(
        private readonly WhatsAppService $whatsAppService
    ) {
    }
    /**
     * Lista los pagos registrados.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        $consulta = Pago::query()
            ->with([
                'pedido',
                'usuario',
            ]);

        if ($request->filled('pedido_id')) {
            $consulta->where(
                'pedido_id',
                $request->integer('pedido_id')
            );
        }

        if ($request->filled('metodo_pago')) {
            $consulta->where(
                'metodo_pago',
                $request->input('metodo_pago')
            );
        }

        if ($request->filled('estado')) {
            $consulta->where(
                'estado',
                $request->input('estado')
            );
        }

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

        $pagos = $consulta
            ->orderByDesc('pagado_en')
            ->paginate($porPagina)
            ->withQueryString();

        return PagoResource::collection(
            $pagos
        )->additional([
            'correcto' => true,

            'mensaje' =>
                'Los pagos fueron consultados correctamente.',
        ]);
    }

    /**
     * Registra un pago sobre un pedido.
     */
    public function store(
        StorePagoRequest $request
    ): JsonResponse {
        $datos = $request->validated();

        $resultado = DB::transaction(
            function () use (
                $datos,
                $request
            ): array {
                /*
                 * Bloquea temporalmente el pedido para evitar
                 * registrar dos pagos simultáneos incorrectos.
                 */
                $pedido = Pedido::query()
                    ->lockForUpdate()
                    ->findOrFail(
                        $datos['pedido_id']
                    );

                /*
                * Guarda el número de WhatsApp
                * directamente en el pedido.
                */
                $pedido->cliente_telefono =
                    $datos['cliente_telefono'];

                $pedido->save();

                
                if ($pedido->estado === 'cancelado') {
                    throw ValidationException::withMessages([
                        'pedido_id' => [
                            'No puedes pagar un pedido cancelado.',
                        ],
                    ]);
                }

                $pagadoCentavos = $this->aCentavos(
                    $pedido->pagos()
                        ->where(
                            'estado',
                            'aprobado'
                        )
                        ->sum('monto')
                );

                $totalCentavos = $this->aCentavos(
                    $pedido->total
                );

                $pendienteCentavos = max(
                    0,
                    $totalCentavos - $pagadoCentavos
                );

                if ($pendienteCentavos <= 0) {
                    throw ValidationException::withMessages([
                        'pedido_id' => [
                            'Este pedido ya está pagado completamente.',
                        ],
                    ]);
                }

                $montoCentavos = $this->aCentavos(
                    $datos['monto']
                );

                if (
                    $montoCentavos >
                    $pendienteCentavos
                ) {
                    throw ValidationException::withMessages([
                        'monto' => [
                            'El monto no puede superar el saldo pendiente.',
                        ],
                    ]);
                }

                $montoRecibido = null;
                $cambioCentavos = 0;

                if (
                    $datos['metodo_pago'] ===
                    'efectivo'
                ) {
                    $recibidoCentavos =
                        $this->aCentavos(
                            $datos['monto_recibido']
                        );

                    if (
                        $recibidoCentavos <
                        $montoCentavos
                    ) {
                        throw ValidationException::withMessages([
                            'monto_recibido' => [
                                'El monto recibido es insuficiente.',
                            ],
                        ]);
                    }

                    $montoRecibido =
                        $this->deCentavos(
                            $recibidoCentavos
                        );

                    $cambioCentavos =
                        $recibidoCentavos -
                        $montoCentavos;
                }

                $pago = $pedido
                    ->pagos()
                    ->create([
                        'usuario_id' =>
                            $request->user()->id,

                        'metodo_pago' =>
                            $datos['metodo_pago'],

                        'monto' =>
                            $this->deCentavos(
                                $montoCentavos
                            ),

                        'monto_recibido' =>
                            $montoRecibido,

                        'cambio' =>
                            $this->deCentavos(
                                $cambioCentavos
                            ),

                        'referencia' =>
                            $datos['referencia'] ?? null,

                        'estado' =>
                            'aprobado',

                        'pagado_en' =>
                            now(),

                        'observaciones' =>
                            $datos['observaciones'] ?? null,
                    ]);

                $pago->load([
                    'pedido',
                    'usuario',
                ]);

               $saldoPendiente = $this->deCentavos(
        $pendienteCentavos -
         $montoCentavos
);

                return [
                    'pago' =>
                        $pago,

                    'saldo_pendiente' =>
                        $saldoPendiente,

                    'cliente_telefono' =>
                        $pedido->cliente_telefono,
                ];
            }
        );

                /*
                * El mensaje se envía después de confirmar el pago
                * en la base de datos. Una falla de WhatsApp no
                * elimina ni revierte el pago registrado.
                */
                $whatsAppEnviado = null;

                if (
                    (float) $resultado['saldo_pendiente'] === 0.0
                ) {
                    $whatsAppEnviado =
                        $this->whatsAppService
                            ->enviarMensajePrueba(
                                $resultado['cliente_telefono']
                            );
                }


        return response()->json([
            'correcto' => true,

            'mensaje' =>
                'El pago fue registrado correctamente.',

            'pago' =>
                (new PagoResource(
                    $resultado['pago']
                ))->resolve($request),

            'saldo_pendiente' =>
                $resultado['saldo_pendiente'],
             'whatsapp_enviado' =>
                $whatsAppEnviado,
        ], 201);
    }

    /**
     * Muestra un pago específico.
     */
    public function show(
        Pago $pago
    ): JsonResponse {
        $pago->load([
            'pedido',
            'usuario',
        ]);

        return response()->json([
            'correcto' => true,

            'mensaje' =>
                'El pago fue consultado correctamente.',

            'pago' =>
                (new PagoResource($pago))
                    ->resolve(),
        ]);
    }

    /**
     * Convierte un monto monetario a centavos.
     */
    private function aCentavos(
        int|float|string|null $monto
    ): int {
        return (int) round(
            (float) $monto * 100
        );
    }

    /**
     * Convierte centavos nuevamente a pesos.
     */
    private function deCentavos(
        int $centavos
    ): float {
        return round(
            $centavos / 100,
            2
        );
    }
}