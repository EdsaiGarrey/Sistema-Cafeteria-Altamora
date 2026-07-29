<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VerificacionCorreoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_reenviar_correo_de_verificacion(): void
    {
        Notification::fake();

        $usuario = User::factory()
            ->unverified()
            ->create();

        Sanctum::actingAs($usuario);

        $respuesta = $this->postJson(
            '/api/autenticacion/reenviar-verificacion-correo'
        );

        $respuesta
            ->assertStatus(202)
            ->assertJson([
                'correcto' => true,
                'mensaje' =>
                    'Se envió un nuevo enlace de verificación.',
            ]);

        Notification::assertSentTo(
            $usuario,
            VerifyEmail::class
        );
    }

    public function test_usuario_puede_verificar_su_correo(): void
    {
        $usuario = User::factory()
            ->unverified()
            ->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $usuario->getKey(),
                'hash' => sha1(
                    $usuario->getEmailForVerification()
                ),
            ]
        );

        $respuesta = $this->getJson($url);

        $respuesta
            ->assertOk()
            ->assertJson([
                'correcto' => true,
                'mensaje' =>
                    'El correo electrónico fue verificado correctamente.',
            ]);

        $this->assertNotNull(
            $usuario->fresh()->email_verified_at
        );
    }

    public function test_enlace_sin_firma_no_puede_verificar_correo(): void
    {
        $usuario = User::factory()
            ->unverified()
            ->create();

        $url = route(
            'verification.verify',
            [
                'id' => $usuario->getKey(),
                'hash' => sha1(
                    $usuario->getEmailForVerification()
                ),
            ]
        );

        $this->getJson($url)
            ->assertForbidden();

        $this->assertNull(
            $usuario->fresh()->email_verified_at
        );
    }
}