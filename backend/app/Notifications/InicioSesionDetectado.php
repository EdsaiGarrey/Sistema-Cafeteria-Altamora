<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InicioSesionDetectado extends Notification
{
    use Queueable;

    /**
     * Datos del inicio de sesión que se mostrarán en el correo.
     */
    public function __construct(
        public readonly string $fecha,
        public readonly string $direccionIp,
        public readonly string $agenteUsuario
    ) {
    }

    /**
     * Define el canal utilizado para enviar la notificación.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Construye el correo de alerta de seguridad.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(
                'Nuevo inicio de sesión en Altamora Café'
            )
            ->greeting(
                'Hola, '.$notifiable->name
            )
            ->line(
                'Se detectó un nuevo inicio de sesión en tu cuenta de Altamora Café.'
            )
            ->line(
                'Fecha y hora: '.$this->fecha
            )
            ->line(
                'Dirección IP: '.$this->direccionIp
            )
            ->line(
                'Dispositivo o navegador: '.$this->agenteUsuario
            )
            ->line(
                'Si reconoces esta actividad, no necesitas realizar ninguna acción.'
            )
            ->line(
                'Si no fuiste tú, cambia tu contraseña lo antes posible.'
            )
            ->salutation(
                'Atentamente, Altamora Café'
            );
    }

    /**
     * Representación de la notificación como arreglo.
     *
     * @return array<string, string>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'fecha' => $this->fecha,
            'direccion_ip' => $this->direccionIp,
            'agente_usuario' => $this->agenteUsuario,
        ];
    }
}