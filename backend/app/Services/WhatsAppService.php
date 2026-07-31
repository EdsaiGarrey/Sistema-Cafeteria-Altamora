<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class WhatsAppService
{
    /**
     * Envía la plantilla de prueba proporcionada por Meta.
     */
    public function enviarMensajePrueba(
        string $telefono
    ): bool {
        try {
            $version = config(
                'services.whatsapp.version'
            );

            $phoneNumberId = config(
                'services.whatsapp.phone_number_id'
            );

            $token = config(
                'services.whatsapp.token'
            );

            /*
             * Agrega el código de México al número
             * de diez dígitos escrito en el sistema.
             */
            $telefonoCompleto = '52' . $telefono;

            $respuesta = Http::withToken($token)
                ->acceptJson()
                ->post(
                    "https://graph.facebook.com/{$version}/{$phoneNumberId}/messages",
                    [
                        'messaging_product' =>
                            'whatsapp',

                        'to' =>
                            $telefonoCompleto,

                        'type' =>
                            'template',

                        'template' => [
                            'name' =>
                                'hello_world',

                            'language' => [
                                'code' =>
                                    'en_US',
                            ],
                        ],
                    ]
                );

            if ($respuesta->successful()) {
                return true;
            }

            Log::error(
                'Meta rechazó el mensaje de WhatsApp.',
                [
                    'estado_http' =>
                        $respuesta->status(),

                    'respuesta' =>
                        $respuesta->json(),
                ]
            );

            return false;
        } catch (Throwable $error) {
            Log::error(
                'No se pudo conectar con WhatsApp.',
                [
                    'mensaje' =>
                        $error->getMessage(),
                ]
            );

            return false;
        }
    }
}