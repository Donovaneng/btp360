<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use PDO;

class PasswordResetController extends Controller {

    /**
     * POST /auth/forgot-password
     * Génère un token de réinitialisation et le stocke en base
     */
    public function forgotPassword() {
        $data = $this->getRequestData();
        $email = trim($data['email'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Adresse email invalide'], 400);
        }

        $db = Database::getInstance();

        // Vérifier si l'utilisateur existe (on ne révèle pas si l'email est trouvé ou non)
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Supprimer les anciens tokens pour cet email
            $db->prepare("DELETE FROM password_resets WHERE email = ?")->execute([$email]);

            // Générer un token sécurisé
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 heure

            $db->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)")
               ->execute([$email, $token, $expiresAt]);

            $resetLink = FRONTEND_URL . "/reset-password?token=$token";
            
            $html = "
                <h2>Réinitialisation de votre mot de passe</h2>
                <p>Bonjour,</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe sur BTP 360.</p>
                <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant 1 heure.</p>
                <p style='text-align:center; margin-top:30px;'>
                    <a href='{$resetLink}' class='btn' style='background-color:#ff6b00;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Réinitialiser mon mot de passe</a>
                </p>
                <br/>
                <p style='font-size: 12px; color: #888;'>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
            ";

            \App\Core\EmailService::sendHtml($email, 'Réinitialisation de mot de passe - BTP 360', $html);

            // On logge aussi pour le mode dev
            error_log("BTP360 Reset link for $email: $resetLink");
        }

        // Toujours retourner succès (sécurité anti-enumération)
        return $this->json(['message' => 'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.']);
    }

    /**
     * POST /auth/reset-password
     * Valide le token et met à jour le mot de passe
     */
    public function resetPassword() {
        $data = $this->getRequestData();
        $token    = trim($data['token'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($token) || empty($password)) {
            return $this->json(['error' => 'Données manquantes'], 400);
        }

        if (strlen($password) < 6) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 6 caractères'], 400);
        }

        $db = Database::getInstance();

        // Vérifier le token
        $stmt = $db->prepare("SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $reset = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reset) {
            return $this->json(['error' => 'Lien de réinitialisation invalide ou expiré'], 400);
        }

        // Mettre à jour le mot de passe
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $db->prepare("UPDATE users SET password = ? WHERE email = ?")
           ->execute([$hashed, $reset['email']]);

        // Supprimer le token utilisé
        $db->prepare("DELETE FROM password_resets WHERE token = ?")->execute([$token]);

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.']);
    }
}
