<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\InicioSesionDetectado;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ComunicacionCorreoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_envia_correo_de_verificacion(): void
    {
        Notification::fake();

        $respuesta = $this->postJson(
            '/api/autenticacion/registro',
            [
                'name' => 'Usuario Altamora',
                'email' => 'usuario@altamora.test',
                'password' => 'Altamora@2026',
                'password_confirmation' => 'Altamora@2026',
            ]
        );

        $respuesta
            ->assertCreated()
            ->assertJson([
                'correcto' => true,
                'verificacion_correo_enviada' => true,
            ]);

        $usuario = User::where(
            'email',
            'usuario@altamora.test'
        )->firstOrFail();

        $this->assertNull(
            $usuario->email_verified_at
        );

        Notification::assertSentTo(
            $usuario,
            VerifyEmail::class
        );
    }

    public function test_inicio_sesion_envia_alerta_de_seguridad(): void
    {
        Notification::fake();

        $usuario = User::factory()->create([
            'email' => 'seguridad@altamora.test',
            'password' => Hash::make('Altamora@2026'),
        ]);

        $respuesta = $this->postJson(
            '/api/autenticacion/inicio-sesion',
            [
                'email' => 'seguridad@altamora.test',
                'password' => 'Altamora@2026',
            ]
        );

        $respuesta
            ->assertOk()
            ->assertJson([
                'correcto' => true,
                'notificacion_seguridad_enviada' => true,
            ]);

        Notification::assertSentTo(
            $usuario,
            InicioSesionDetectado::class
        );
    }

    public function test_credenciales_incorrectas_no_envian_alerta(): void
    {
        Notification::fake();

        $usuario = User::factory()->create([
            'email' => 'sin-alerta@altamora.test',
            'password' => Hash::make('Altamora@2026'),
        ]);

        $this->postJson(
            '/api/autenticacion/inicio-sesion',
            [
                'email' => 'sin-alerta@altamora.test',
                'password' => 'ContrasenaIncorrecta@2026',
            ]
        )->assertUnauthorized();

        Notification::assertNotSentTo(
            $usuario,
            InicioSesionDetectado::class
        );
    }
}