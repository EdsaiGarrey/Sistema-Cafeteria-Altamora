<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificacionCorreoController extends Controller
{
    /**
     * Verifica el correo mediante el enlace firmado enviado al usuario.
     */
    public function verificar(
        int $id,
        string $hash
    ): JsonResponse {
        $usuario = User::find($id);

        if ($usuario === null) {
            return response()->json([
                'correcto' => false,
                'mensaje' => 'El usuario no fue encontrado.',
            ], 404);
        }

        $hashEsperado = sha1(
            $usuario->getEmailForVerification()
        );

        if (!hash_equals($hashEsperado, $hash)) {
            return response()->json([
                'correcto' => false,
                'mensaje' => 'El enlace de verificación no es válido.',
            ], 403);
        }

        if ($usuario->hasVerifiedEmail()) {
            return response()->json([
                'correcto' => true,
                'mensaje' => 'El correo electrónico ya estaba verificado.',
            ]);
        }

        if ($usuario->markEmailAsVerified()) {
            event(new Verified($usuario));
        }

        return response()->json([
            'correcto' => true,
            'mensaje' => 'El correo electrónico fue verificado correctamente.',
        ]);
    }

    /**
     * Reenvía el enlace de verificación al usuario autenticado.
     */
    public function reenviar(
        Request $request
    ): JsonResponse {
        /** @var User $usuario */
        $usuario = $request->user();

        if ($usuario->hasVerifiedEmail()) {
            return response()->json([
                'correcto' => false,
                'mensaje' => 'El correo electrónico ya está verificado.',
            ], 409);
        }

        $usuario->sendEmailVerificationNotification();

        return response()->json([
            'correcto' => true,
            'mensaje' => 'Se envió un nuevo enlace de verificación.',
        ], 202);
    }
}