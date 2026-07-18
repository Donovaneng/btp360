<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\JwtHelper;
use App\Models\UserModel;

class ProfileController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    /**
     * Récupère les données du profil de l'utilisateur connecté
     */
    public function show() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData || empty($userData['email'])) {
            return $this->json(['error' => 'Non authentifié ou token invalide'], 401);
        }

        $db = \App\Core\Database::getInstance();

        $stmt = $db->prepare("
            SELECT u.*,
                   c.id as category_id,
                   c.name as category_name,
                   (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) as projects_count,
                   (SELECT COUNT(*) FROM leads l
                    WHERE l.partner_id = u.id OR l.client_id = u.id) as leads_count,
                   (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as avg_rating,
                   (SELECT COUNT(*) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as reviews_count
            FROM users u
            LEFT JOIN user_categories uc ON uc.user_id = u.id
            LEFT JOIN categories c ON c.id = uc.category_id
            WHERE u.email = ?
            LIMIT 1
        ");
        $stmt->execute([$userData['email']]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);
        
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        unset($user['password']); // Sécurité
        return $this->json($user);
    }

    /**
     * Met à jour les informations du profil
     */
    public function update() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) return $this->json(['error' => 'Non authentifié'], 401);

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) return $this->json(['error' => 'Données invalides'], 400);

        if ($this->userModel->update($userData['user_id'], $input)) {
            return $this->json(['message' => 'Profil mis à jour avec succès']);
        }

        return $this->json(['error' => 'Échec de la mise à jour'], 500);
    }

    /**
     * Met à jour l'avatar de l'utilisateur
     */
    public function updateAvatar() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) return $this->json(['error' => 'Non authentifié'], 401);

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            return $this->json(['error' => 'Aucun fichier reçu'], 400);
        }

        $file = $_FILES['avatar'];
        $uploadDir = __DIR__ . '/../../uploads/avatars/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'avatar_' . $userData['user_id'] . '_' . time() . '.' . $extension;
        
        if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            // URL relative pour le frontend (en utilisant la constante globale)
            $avatarUrl = UPLOAD_URL . 'avatars/' . $filename;
            $this->userModel->update($userData['user_id'], ['avatar_url' => $avatarUrl]);
            
            return $this->json(['message' => 'Avatar mis à jour', 'url' => $avatarUrl]);
        }

        return $this->json(['error' => 'Erreur lors de l\'upload'], 500);
    }

    /**
     * Change le mot de passe de l'utilisateur connecté
     */
    public function updatePassword() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) return $this->json(['error' => 'Non authentifié'], 401);

        $input = $this->getRequestData();
        $currentPwd = $input['current_password'] ?? '';
        $newPwd     = $input['new_password'] ?? '';

        if (empty($currentPwd) || empty($newPwd)) {
            return $this->json(['error' => 'Champs requis manquants'], 400);
        }

        if (strlen($newPwd) < 6) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 6 caractères'], 400);
        }

        // Vérifier l'ancien mot de passe
        $db = \App\Core\Database::getInstance();
        $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userData['user_id']]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$user || !password_verify($currentPwd, $user['password'])) {
            return $this->json(['error' => 'Mot de passe actuel incorrect'], 401);
        }

        // Mettre à jour
        $hashed = password_hash($newPwd, PASSWORD_BCRYPT);
        $db->prepare("UPDATE users SET password = ? WHERE id = ?")
           ->execute([$hashed, $userData['user_id']]);

        return $this->json(['message' => 'Mot de passe mis à jour avec succès']);
    }
}
