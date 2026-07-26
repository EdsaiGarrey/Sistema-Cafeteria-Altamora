<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pedido\StorePedidoRequest;
use App\Http\Requests\Pedido\UpdatePedidoRequest;
use App\Http\Resources\PedidoResource;
use App\Models\Caja;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class PedidoController extends Controller
{
    /**
     * Muestra los pedidos con filtros y paginación.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        $consulta = Pedido::query()
            ->with([
                'caja',
                'usuario',
            ]);

        /*
         * Busca por folio o por nombre del cliente.
         */
        if ($request->filled('buscar')) {
            $buscar = trim(
                (string) $request->input('buscar')
            );

            $consulta->where(function ($subconsulta) use ($buscar) {
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
            });
        }

        // Filtra por estado.
        if ($request->filled('estado')) {
            $consulta->where(
                'estado',
                $request->input('estado')
            );
        }

        // Filtra por tipo de servicio.
        if ($request->filled('tipo_servicio')) {
            $consulta->where(
                'tipo_servicio',
                $request->input('tipo_servicio')
            );
        }

        // Filtra por caja.
        if ($request->filled('caja_id')) {
            $consulta->where(
                'caja_id',
                $request->integer('caja_id')
            );
        }

        // Filtra desde una fecha.
        if ($request->filled('fecha_desde')) {
            $consulta->whereDate(
                'pedido_en',
                '>=',
                $request->input('fecha_desde')
            );
        }

        // Filtra hasta una fecha.
        if ($request->filled('fecha_hasta')) {
            $consulta->whereDate(
                'pedido_en',
                '<=',
                $request->input('fecha_hasta')
            );
        }

        /*
         * Limita la cantidad máxima a 100 registros
         * por página.
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

        $pedidos = $consulta
            ->orderByDesc('pedido_en')
            ->paginate($porPagina)
            ->withQueryString();

        return PedidoResource::collection(
            $pedidos
        )->additional([
            'correcto' => true,
            'mensaje' =>
                'Los pedidos fueron consultados correctamente.',
        ]);
    }

    /**
     * Registra un pedido nuevo.
     */
    public function store(
        StorePedidoRequest $request
    ): JsonResponse {
        $datos = $request->validated();

        $caja = Caja::findOrFail(
            $datos['caja_id']
        );

        /*
         * No se pueden registrar pedidos dentro
         * de una caja cerrada.
         */
        if ($caja->estado !== 'abierta') {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No puedes registrar pedidos en una caja cerrada.',

                'errors' => [
                    'caja_id' => [
                        'La caja seleccionada está cerrada.',
                    ],
                ],
            ], 422);
        }

        $pedido = Pedido::create([
            'folio' => $this->generarFolio(),
            'caja_id' => $caja->id,
            'usuario_id' => $request->user()->id,

            'cliente_nombre' =>
                $datos['cliente_nombre'] ?? null,

            'tipo_servicio' =>
                $datos['tipo_servicio'],

            'estado' => 'pendiente',
            'subtotal' => 0,
            'descuento' => 0,
            'impuestos' => 0,
            'total' => 0,

            'notas' =>
                $datos['notas'] ?? null,

            'pedido_en' => now(),
        ]);

        $pedido->load([
            'caja',
            'usuario',
        ]);

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El pedido fue registrado correctamente.',

            'pedido' =>
                (new PedidoResource($pedido))
                    ->resolve($request),
        ], 201);
    }

    /**
     * Muestra un pedido específico.
     */
    public function show(
        Pedido $pedido
    ): JsonResponse {
        $pedido->load([
            'caja',
            'usuario',
            'pagos',
        ]);

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El pedido fue consultado correctamente.',

            'pedido' =>
                (new PedidoResource($pedido))
                    ->resolve(),
        ]);
    }

    /**
     * Actualiza los datos operativos del pedido.
     */
    public function update(
        UpdatePedidoRequest $request,
        Pedido $pedido
    ): JsonResponse {
        /*
         * Los pedidos cancelados no deben modificarse.
         * La cancelación formal se implementará después.
         */
        if ($pedido->estado === 'cancelado') {
            return response()->json([
                'correcto' => false,
                'mensaje' =>
                    'No puedes modificar un pedido cancelado.',
            ], 422);
        }

        $datos = $request->validated();

        /*
         * Marca la fecha de finalización cuando
         * el pedido cambia a entregado.
         */
        if (
            isset($datos['estado']) &&
            $datos['estado'] === 'entregado'
        ) {
            $datos['completado_en'] = now();
        }

        /*
         * Si regresa a otro estado, elimina
         * temporalmente la fecha de finalización.
         */
        if (
            isset($datos['estado']) &&
            $datos['estado'] !== 'entregado'
        ) {
            $datos['completado_en'] = null;
        }

        $pedido->fill($datos);
        $pedido->save();

        $pedido->load([
            'caja',
            'usuario',
        ]);

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El pedido fue actualizado correctamente.',

            'pedido' =>
                (new PedidoResource($pedido))
                    ->resolve($request),
        ]);
    }

    /**
     * Genera un folio único para el pedido.
     */
    private function generarFolio(): string
    {
        do {
            $folio = 'PED-'
                . now()->format('Ymd-His')
                . '-'
                . Str::upper(
                    Str::random(4)
                );
        } while (
            Pedido::where(
                'folio',
                $folio
            )->exists()
        );

        return $folio;
    }
}