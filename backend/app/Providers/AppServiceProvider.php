<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Registra los servicios utilizados por la aplicación.
     */
    public function register(): void
    {
        //
    }

    /**
     * Configura los servicios cuando Laravel inicia.
     */
    public function boot(): void
    {
        /*
         * Personaliza el enlace enviado al correo para que el usuario
         * sea dirigido a la pantalla de React donde podrá establecer
         * una contraseña nueva.
         */
        ResetPassword::createUrlUsing(
            function (User $usuario, string $token): string {
                // Dirección local utilizada por el frontend de React.
                $urlFrontend = rtrim(
                    (string) config(
                        'app.frontend_url',
                        'http://localhost:5173'
                    ),
                    '/'
                );

                // Construimos el enlace incluyendo el token y el correo.
                return $urlFrontend
                    . '/restablecer-contrasena?token='
                    . urlencode($token)
                    . '&email='
                    . urlencode($usuario->getEmailForPasswordReset());
            }
        );
    }
}