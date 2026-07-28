<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Producto\StoreProductoRequest;
use App\Http\Requests\Producto\UpdateProductoRequest;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductoController extends Controller
{
    /**
     * Lista los productos.
     */
    public function index(): AnonymousResourceCollection
    {
        $productos = Producto::with('categoria')
            ->orderBy('nombre')
            ->paginate(10);

        return ProductoResource::collection(
            $productos
        )->additional([
            'correcto' => true,
            'mensaje' =>
                'Los productos fueron consultados correctamente.',
        ]);
    }

    /**
     * Lista los productos activos disponibles
     * para registrar pedidos.
     */
    public function disponibles(): AnonymousResourceCollection
    {
        $productos = Producto::with('categoria')
            ->where('activo', true)
            ->orderBy('nombre')
            ->get();

        return ProductoResource::collection(
            $productos
        )->additional([
            'correcto' => true,
            'mensaje' =>
                'Los productos disponibles fueron consultados correctamente.',
        ]);
    }


    /**
     * Registra un producto.
     */
    public function store(
        StoreProductoRequest $request
    ): JsonResponse {
        $producto = Producto::create(
            $request->validated()
        );

        $producto->load('categoria');

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El producto fue registrado correctamente.',

            'producto' =>
                (new ProductoResource($producto))
                    ->resolve($request),
        ], 201);
    }

    /**
     * Consulta un producto.
     */
    public function show(
        Producto $producto
    ): JsonResponse {
        $producto->load('categoria');

        return response()->json([
            'correcto' => true,

            'producto' =>
                (new ProductoResource($producto))
                    ->resolve(),
        ]);
    }

    /**
     * Actualiza un producto.
     */
    public function update(
        UpdateProductoRequest $request,
        Producto $producto
    ): JsonResponse {
        $producto->update(
            $request->validated()
        );

        $producto->load('categoria');

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El producto fue actualizado correctamente.',

            'producto' =>
                (new ProductoResource($producto))
                    ->resolve($request),
        ]);
    }

    /**
     * Elimina un producto.
     */
    public function destroy(
        Producto $producto
    ): JsonResponse {
        $producto->delete();

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'El producto fue eliminado correctamente.',
        ]);
    }
}