<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],



    /*
|--------------------------------------------------------------------------
| WhatsApp Cloud API
|--------------------------------------------------------------------------
|
| Credenciales utilizadas para enviar comprobantes mediante
| la API oficial de WhatsApp Business de Meta.
|
*/

        'whatsapp' => [
            'version' => env(
                'WHATSAPP_API_VERSION',
                'v25.0'
            ),

            'phone_number_id' => env(
                'WHATSAPP_PHONE_NUMBER_ID'
            ),

            'token' => env(
                'WHATSAPP_TOKEN'
            ),
        ],
    /*
    |--------------------------------------------------------------------------
    | Dirección del frontend de Altamora Café
    |--------------------------------------------------------------------------
    |
    | Laravel utiliza esta dirección para regresar al usuario a React
    | después de verificar correctamente su correo electrónico.
    |
    */



    'frontend_url' => env(
        'FRONTEND_URL',
        'http://localhost:5173'
    ),
];
