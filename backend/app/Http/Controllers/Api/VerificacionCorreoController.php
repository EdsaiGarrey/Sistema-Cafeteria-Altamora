<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerificacionCorreoController extends Controller
{
    /**
     * Verifica el correo mediante el enlace firmado enviado al usuario.
     */
    public function verificar(
        Request $request,
        int $id,
        string $hash
    ): JsonResponse|RedirectResponse {
        $usuario = User::find($id);

        if ($usuario === null) {
            return $this->responder(
                request: $request,
                correcto: false,
                mensaje: 'El usuario no fue encontrado.',
                codigoHttp: 404,
                estadoFrontend: 'error'
            );
        }

        $hashEsperado = sha1(
            $usuario->getEmailForVerification()
        );

        if (!hash_equals($hashEsperado, $hash)) {
            return $this->responder(
                request: $request,
                correcto: false,
                mensaje: 'El enlace de verificación no es válido.',
                codigoHttp: 403,
                estadoFrontend: 'error'
            );
        }

        if ($usuario->hasVerifiedEmail()) {
            return $this->responder(
                request: $request,
                correcto: true,
                mensaje: 'El correo electrónico ya estaba verificado.',
                codigoHttp: 200,
                estadoFrontend: 'exito'
            );
        }

        if ($usuario->markEmailAsVerified()) {
            event(new Verified($usuario));
        }

        return $this->responder(
            request: $request,
            correcto: true,
            mensaje: 'El correo electrónico fue verificado correctamente.',
            codigoHttp: 200,
            estadoFrontend: 'exito'
        );
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

    /**
     * Devuelve JSON para la API o redirige al frontend cuando
     * el enlace se abre directamente desde un navegador.
     */
    private function responder(
        Request $request,
        bool $correcto,
        string $mensaje,
        int $codigoHttp,
        string $estadoFrontend
    ): JsonResponse|RedirectResponse {
        if ($request->expectsJson()) {
            return response()->json([
                'correcto' => $correcto,
                'mensaje' => $mensaje,
            ], $codigoHttp);
        }

        $frontend = rtrim(
            (string) config(
                'services.frontend_url',
                'http://localhost:5173'
            ),
            '/'
        );

        $parametros = http_build_query([
            'estado' => $estadoFrontend,
            'mensaje' => $mensaje,
        ]);

        return redirect()->away(
            $frontend.'/correo-verificado?'.$parametros
        );
    }
}