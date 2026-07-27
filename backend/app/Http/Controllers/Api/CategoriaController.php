<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Categoria\StoreCategoriaRequest;
use App\Http\Requests\Categoria\UpdateCategoriaRequest;
use App\Http\Resources\CategoriaResource;
use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoriaController extends Controller
{
    /**
     * Lista las categorías con búsqueda,
     * filtro de estado y paginación.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        $categorias = Categoria::query()
            ->when(
                $request->filled('buscar'),
                function ($consulta) use ($request) {
                    $consulta->where(
                        'nombre',
                        'like',
                        '%' . $request->buscar . '%'
                    );
                }
            )
            ->when(
                $request->has('activo'),
                function ($consulta) use ($request) {
                    $consulta->where(
                        'activo',
                        $request->boolean('activo')
                    );
                }
            )
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return CategoriaResource::collection(
            $categorias
        )->additional([
            'correcto' => true,
            'mensaje' =>
                'Las categorías fueron consultadas correctamente.',
        ]);
    }

    /**
     * Registra una categoría.
     */
    public function store(
        StoreCategoriaRequest $request
    ): JsonResponse {
        $categoria = Categoria::create(
            $request->validated()
        );

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'La categoría fue registrada correctamente.',

            'categoria' =>
                (new CategoriaResource($categoria))
                    ->resolve($request),
        ], 201);
    }

    /**
     * Consulta una categoría.
     */
    public function show(
        Categoria $categoria
    ): JsonResponse {
        return response()->json([
            'correcto' => true,
            'categoria' =>
                (new CategoriaResource($categoria))
                    ->resolve(),
        ]);
    }

    /**
     * Actualiza una categoría.
     */
    public function update(
        UpdateCategoriaRequest $request,
        Categoria $categoria
    ): JsonResponse {
        $categoria->update(
            $request->validated()
        );

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'La categoría fue actualizada correctamente.',

            'categoria' =>
                (new CategoriaResource($categoria->fresh()))
                    ->resolve($request),
        ]);
    }

    /**
     * Elimina una categoría.
     */
    public function destroy(
        Categoria $categoria
    ): JsonResponse {
        $categoria->delete();

        return response()->json([
            'correcto' => true,
            'mensaje' =>
                'La categoría fue eliminada correctamente.',
        ]);
    }
}