<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use App\Core\JwtHelper;
use PDO;

class GoogleAuthController extends Controller {

    /**
     * Connexion / Inscription via Google OAuth
     * Reçoit : { credential: "google_id_token", role_id: 2 }
     */
    public function handleGoogle() {
        $data = $this->getRequestData();

        $credential = $data['credential'] ?? '';
        $roleId = (int)($data['role_id'] ?? 2); // Par défaut : Client

        if (empty($credential)) {
            return $this->json(['error' => 'Token Google manquant'], 400);
        }

        // 1. Vérifier le token Google via l'API officielle
        $googleUser = $this->verifyGoogleToken($credential);

        if (!$googleUser) {
            return $this->json(['error' => 'Token Google invalide ou expiré'], 401);
        }

        $googleId   = $googleUser['sub'];
        $email      = $googleUser['email'];
        $name       = $googleUser['name'];
        $avatarUrl  = $googleUser['picture'] ?? null;

        $db = Database::getInstance();

        // 2. Chercher l'utilisateur par google_id OU par email
        $stmt = $db->prepare("SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1");
        $stmt->execute([$googleId, $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Mettre à jour le google_id si absent (compte créé en email/pass avant)
            if (empty($user['google_id'])) {
                $db->prepare("UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?")
                   ->execute([$googleId, $avatarUrl, $user['id']]);
            }
        } else {
            // 3. Créer un nouvel utilisateur Google
            // Valider que le role_id est acceptable (pas admin)
            if (!in_array($roleId, [2, 3])) {
                $roleId = 2;
            }

            $stmt = $db->prepare(
                "INSERT INTO users (role_id, name, email, password, google_id, avatar_url, created_at) 
                 VALUES (:role_id, :name, :email, :password, :google_id, :avatar_url, NOW())"
            );
            $stmt->execute([
                'role_id'    => $roleId,
                'name'       => $name,
                'email'      => $email,
                'password'   => password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT), // mdp aléatoire inutilisé
                'google_id'  => $googleId,
                'avatar_url' => $avatarUrl,
            ]);

            $newId = $db->lastInsertId();
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$newId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // 4. Générer le JWT BTP 360
        $token = JwtHelper::encode([
            'user_id' => $user['id'],
            'role_id' => $user['role_id'],
            'email'   => $user['email'],
            'exp'     => time() + (3600 * 24 * 7) // 7 jours
        ]);

        return $this->json([
            'message' => 'Connexion Google réussie',
            'token'   => $token,
            'user'    => [
                'id'         => $user['id'],
                'name'       => $user['name'],
                'email'      => $user['email'],
                'role_id'    => $user['role_id'],
                'avatar_url' => $user['avatar_url'],
            ]
        ]);
    }

    /**
     * Vérifie le token Google (access_token ou id_token) et retourne les infos utilisateur
     */
    private function verifyGoogleToken(string $token): ?array {
        // Essaie d'abord avec access_token (implicit flow depuis useGoogleLogin)
        $userinfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

        $ctx = stream_context_create([
            'http' => [
                'method'  => 'GET',
                'header'  => "Authorization: Bearer $token\r\n",
                'timeout' => 10,
            ],
            'ssl' => [
                'verify_peer'      => false, // XAMPP local — activer en prod
                'verify_peer_name' => false,
            ]
        ]);

        $response = @file_get_contents($userinfoUrl, false, $ctx);

        if ($response) {
            $payload = json_decode($response, true);
            if (!empty($payload['sub']) && !empty($payload['email'])) {
                return $payload;
            }
        }

        // Fallback : id_token (tokeninfo endpoint)
        $tokeninfoUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token);
        $ctx2 = stream_context_create(['ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
        $response2 = @file_get_contents($tokeninfoUrl, false, $ctx2);

        if (!$response2) return null;

        $payload2 = json_decode($response2, true);
        if (empty($payload2['sub']) || empty($payload2['email'])) return null;
        if (isset($payload2['exp']) && $payload2['exp'] < time()) return null;

        return $payload2;
    }
}
