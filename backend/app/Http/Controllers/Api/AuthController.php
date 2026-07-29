<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\InicioSesionDetectado;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario y genera su token de acceso.
     */
    public function registrar(RegisterRequest $request): JsonResponse
    {
        // Obtenemos únicamente los datos que superaron la validación.
        $datos = $request->validated();

        // Creamos al usuario con la contraseña almacenada de forma segura.
        $usuario = User::create([
            'name' => $datos['name'],
            'email' => strtolower(trim($datos['email'])),
            'password' => Hash::make($datos['password']),
        ]);

        // Enviamos el enlace para verificar que el correo pertenece al usuario.
$usuario->sendEmailVerificationNotification();

        // Creamos un token que React utilizará en las peticiones protegidas.
        $token = $usuario
            ->createToken('token-autenticacion')
            ->plainTextToken;

        return response()->json([
            'correcto' => true,
            'mensaje' => 'El usuario fue registrado correctamente.',
            'verificacion_correo_enviada' => true,
            'token' => $token,
            'tipo_token' => 'Bearer',
            'usuario' => new UserResource($usuario),
        ], 201);
    }

    /**
     * Verifica las credenciales y genera un token de acceso.
     */
    public function iniciarSesion(LoginRequest $request): JsonResponse
    {
        // Obtenemos los datos previamente validados.
        $datos = $request->validated();

        // Buscamos al usuario mediante su correo electrónico.
        $usuario = User::where('email', $datos['email'])->first();

        /*
         * Validamos que el usuario exista y que la contraseña enviada
         * coincida con el hash almacenado en la base de datos.
         */
        if (
            !$usuario ||
            !Hash::check($datos['password'], $usuario->password)
        ) {
            return response()->json([
                'correcto' => false,
                'mensaje' => 'El correo electrónico o la contraseña son incorrectos.',
            ], 401);
        }

        // Generamos un token personal para la sesión actual.
        $token = $usuario
            ->createToken('token-autenticacion')
            ->plainTextToken;

            // Notificamos al usuario que su cuenta inició una nueva sesión.
$usuario->notify(
    new InicioSesionDetectado(
        fecha: now()->format('d/m/Y H:i:s'),
        direccionIp: $request->ip() ?? 'No disponible',
        agenteUsuario: $request->userAgent() ?? 'No disponible'
    )
);

        return response()->json([
            'correcto' => true,
            'mensaje' => 'Inicio de sesión realizado correctamente.',
            'notificacion_seguridad_enviada' => true,
            'token' => $token,
            'tipo_token' => 'Bearer',
            'usuario' => new UserResource($usuario),
        ]);
    }

    /**
     * Devuelve los datos del usuario autenticado.
     */
    public function perfil(Request $request): JsonResponse
    {
        return response()->json([
            'correcto' => true,
            'usuario' => new UserResource($request->user()),
        ]);
    }

    /**
     * Elimina el token utilizado en la sesión actual.
     */
    public function cerrarSesion(Request $request): JsonResponse
    {
        // Obtenemos el token que fue utilizado en esta petición.
        $tokenActual = $request->user()->currentAccessToken();

        // Eliminamos el token solamente cuando realmente existe.
        if ($tokenActual !== null) {
            $tokenActual->delete();
        }

        return response()->json([
            'correcto' => true,
            'mensaje' => 'La sesión fue cerrada correctamente.',
        ]);
    }

    /**
     * Solicita el envío del enlace para recuperar la contraseña.
     */
    public function solicitarRecuperacion(
        ForgotPasswordRequest $request
    ): JsonResponse {
        /*
         * Laravel busca al usuario, genera un token temporal y envía
         * la notificación al correo electrónico registrado.
         */
        $estado = Password::sendResetLink(
            $request->only('email')
        );

        if ($estado === Password::ResetLinkSent) {
            return response()->json([
                'correcto' => true,
                'mensaje' => 'El enlace de recuperación fue enviado al correo electrónico.',
            ]);
        }

        // Traducimos los posibles errores a mensajes claros en español.
        $mensaje = match ($estado) {
            Password::InvalidUser =>
                'No existe una cuenta asociada con ese correo electrónico.',

            Password::ResetThrottled =>
                'Espera un momento antes de solicitar otro enlace.',

            default =>
                'No fue posible enviar el enlace de recuperación.',
        };

        return response()->json([
            'correcto' => false,
            'mensaje' => $mensaje,
            'errores' => [
                'email' => [$mensaje],
            ],
        ], 422);
    }

    /**
     * Restablece la contraseña mediante el token recibido por correo.
     */
    public function restablecerContrasena(
        ResetPasswordRequest $request
    ): JsonResponse {
        // Validamos el token y actualizamos la contraseña del usuario.
        $estado = Password::reset(
            $request->validated(),
            function (User $usuario, string $contrasena): void {
                // Guardamos la nueva contraseña mediante un hash seguro.
                $usuario->forceFill([
                    'password' => Hash::make($contrasena),
                ])->setRememberToken(Str::random(60));

                $usuario->save();

                /*
                 * Eliminamos las sesiones anteriores para evitar que
                 * permanezcan activos tokens creados con la contraseña vieja.
                 */
                $usuario->tokens()->delete();

                // Informamos a Laravel que la contraseña fue restablecida.
                event(new PasswordReset($usuario));
            }
        );

        if ($estado === Password::PasswordReset) {
            return response()->json([
                'correcto' => true,
                'mensaje' => 'La contraseña fue restablecida correctamente.',
            ]);
        }

        // Definimos el mensaje correspondiente al error recibido.
        $mensaje = match ($estado) {
            Password::InvalidToken =>
                'El token de recuperación no es válido o ya expiró.',

            Password::InvalidUser =>
                'No existe una cuenta asociada con ese correo electrónico.',

            default =>
                'No fue posible restablecer la contraseña.',
        };

        return response()->json([
            'correcto' => false,
            'mensaje' => $mensaje,
            'errores' => [
                'email' => [$mensaje],
            ],
        ], 422);
    }
}