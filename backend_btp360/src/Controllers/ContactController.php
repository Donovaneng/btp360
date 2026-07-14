<?php

namespace App\Controllers;

use App\Core\Controller;

class ContactController extends Controller {

    /**
     * POST /contact - Envoyer un message de contact
     */
    public function send() {
        $data = $this->getRequestData();

        $name    = trim($data['name'] ?? '');
        $email   = trim($data['email'] ?? '');
        $subject = trim($data['subject'] ?? '');
        $message = trim($data['message'] ?? '');

        if (empty($name) || empty($email) || empty($message)) {
            return $this->json(['error' => 'Nom, email et message sont requis'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Adresse email invalide'], 400);
        }

        // Envoyer l'email à l'admin
        $adminEmail = defined('ADMIN_EMAIL') ? ADMIN_EMAIL : 'contact@btp360.com';
        
        $html = "
            <h2>Nouveau message de contact — BTP 360</h2>
            <p><strong>De :</strong> {$name} ({$email})</p>
            <p><strong>Sujet :</strong> " . htmlspecialchars($subject ?: 'Sans sujet') . "</p>
            <hr/>
            <p>" . nl2br(htmlspecialchars($message)) . "</p>
            <br/>
            <p style='color:#999;font-size:12px'>Ce message a été envoyé depuis le formulaire de contact BTP 360.</p>
        ";

        try {
            \App\Core\EmailService::sendHtml($adminEmail, 'Contact BTP 360 : ' . ($subject ?: 'Nouveau message'), $html);
            
            // Envoyer un accusé de réception au visiteur
            $ackHtml = "
                <h2>Merci pour votre message, {$name} !</h2>
                <p>Nous avons bien reçu votre message et reviendrons vers vous sous 24 heures.</p>
                <p><strong>Sujet :</strong> " . htmlspecialchars($subject ?: 'Sans sujet') . "</p>
                <p><strong>Votre message :</strong></p>
                <blockquote style='border-left:3px solid #e65100;padding-left:12px;color:#555'>" . nl2br(htmlspecialchars($message)) . "</blockquote>
                <br/>
                <p>Cordialement,<br/>L'équipe BTP 360</p>
            ";
            \App\Core\EmailService::sendHtml($email, 'Accusé de réception — BTP 360', $ackHtml);

        } catch (\Exception $e) {
            // Log l'erreur mais ne pas bloquer l'utilisateur
            error_log('Contact email error: ' . $e->getMessage());
        }

        return $this->json(['message' => 'Message envoyé avec succès'], 200);
    }
}
