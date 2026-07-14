<?php

namespace App\Core;

/**
 * Service d'envoi d'emails (Wrapper)
 */
class EmailService {
    
    // Adresse email d'expédition par défaut
    private static $fromEmail = 'noreply@btp360.com';
    private static $fromName = 'BTP 360';

    /**
     * Envoie un email au format HTML
     * 
     * @param string $to Adresse email du destinataire
     * @param string $subject Sujet de l'email
     * @param string $htmlContent Contenu de l'email en HTML
     * @return bool True si l'email a été accepté pour livraison, false sinon
     */
    public static function sendHtml($to, $subject, $htmlContent) {
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: " . self::$fromName . " <" . self::$fromEmail . ">\r\n";
        $headers .= "Reply-To: " . self::$fromEmail . "\r\n";
        
        // Template HTML de base pour encadrer le contenu
        $body = "
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background-color: #ff6b00; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; font-weight: bold; font-size: 20px; }
            .content { padding: 20px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #ff6b00; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class='container'>
            <div class='header'>BTP 360</div>
            <div class='content'>
                {$htmlContent}
            </div>
            <div class='footer'>
                Cet email a été envoyé automatiquement par BTP 360. Merci de ne pas y répondre.
            </div>
          </div>
        </body>
        </html>
        ";

        $driver = defined('EMAIL_DRIVER') ? EMAIL_DRIVER : 'log';

        if ($driver === 'log') {
            $logFile = __DIR__ . '/../../emails.log';
            $logContent = "==================================================\n";
            $logContent .= "DATE: " . date('Y-m-d H:i:s') . "\n";
            $logContent .= "TO: " . $to . "\n";
            $logContent .= "SUBJECT: " . $subject . "\n";
            $logContent .= "HEADERS: " . str_replace("\r\n", " | ", $headers) . "\n";
            $logContent .= "BODY:\n" . $body . "\n";
            $logContent .= "==================================================\n\n";
            return file_put_contents($logFile, $logContent, FILE_APPEND) !== false;
        }

        if ($driver === 'brevo') {
            $apiKey = defined('BREVO_API_KEY') ? BREVO_API_KEY : '';
            if (empty($apiKey) || $apiKey === 'VOTRE_CLE_API_BREVO_ICI') {
                error_log("Brevo API Key non configuree dans config.php");
                return false;
            }

            $url = 'https://api.brevo.com/v3/smtp/email';
            $data = [
                'sender' => ['name' => self::$fromName, 'email' => self::$fromEmail],
                'to' => [['email' => $to]],
                'subject' => $subject,
                'htmlContent' => $body
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'accept: application/json',
                'api-key: ' . $apiKey,
                'content-type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                return true;
            } else {
                error_log("Erreur Brevo API (Code $httpCode) : " . $response);
                return false;
            }
        }

        // Driver par defaut : 'mail'
        try {
            return mail($to, $subject, $body, $headers);
        } catch (\Exception $e) {
            error_log("Erreur lors de l'envoi d'email : " . $e->getMessage());
            return false;
        }
    }
}
