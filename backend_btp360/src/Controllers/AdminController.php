<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\AdminModel;
use App\Models\UserModel;
use App\Models\PartnerModel;
use App\Models\ReviewModel;
use App\Core\JwtHelper;
use App\Core\Database;
use PDO;

class AdminController extends Controller {
    private $adminModel;
    private $userModel;
    private $partnerModel;
    private $reviewModel;

    public function __construct() {
        $this->adminModel   = new AdminModel();
        $this->userModel    = new UserModel();
        $this->partnerModel = new PartnerModel();
        $this->reviewModel  = new ReviewModel();
    }

    /**
     * Vérifie que l'utilisateur connecté est bien un admin (role_id = 1)
     */
    private function requireAdmin() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData || $userData['role_id'] != 1) {
            $this->json(['error' => 'Accès non autorisé'], 403);
        }
        return $userData;
    }

    // ─────────────────────────────────────────────
    // STATS
    // ─────────────────────────────────────────────

    /**
     * Retourne les statistiques globales pour l'admin
     */
    public function dashboardStats() {
        $this->requireAdmin();

        $stats   = $this->adminModel->getCounters();
        $activity = $this->adminModel->getRecentActivity();
        $history  = $this->adminModel->getLeadsHistory();

        return $this->json([
            'counters'       => $stats,
            'recentActivity' => $activity,
            'leadsHistory'   => $history
        ]);
    }

    // ─────────────────────────────────────────────
    // CLIENTS
    // ─────────────────────────────────────────────

    /**
     * Retourne la liste de tous les clients (role_id = 2)
     */
    public function getClients() {
        $this->requireAdmin();

        $db   = Database::getInstance();
        $stmt = $db->query(
            "SELECT id, name, email, phone, city, avatar_url, created_at
             FROM users
             WHERE role_id = 2
             ORDER BY created_at DESC"
        );

        return $this->json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Supprime un client (role_id = 2) – Admin uniquement
     */
    public function deleteClient($id) {
        $this->requireAdmin();

        // Vérifier que l'utilisateur est bien un client et non un admin
        $db   = Database::getInstance();
        $stmt = $db->prepare("SELECT id, role_id FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }
        if ($user['role_id'] == 1) {
            return $this->json(['error' => 'Impossible de supprimer un administrateur'], 403);
        }

        if ($this->userModel->delete($id)) {
            return $this->json(['message' => 'Compte client supprimé avec succès']);
        }

        return $this->json(['error' => 'Échec de la suppression'], 500);
    }

    // ─────────────────────────────────────────────
    // PARTENAIRES
    // ─────────────────────────────────────────────

    /**
     * Supprime un partenaire (role_id = 3) – Admin uniquement
     */
    public function deletePartner($id) {
        $this->requireAdmin();

        // Vérifier que le compte est bien un partenaire
        $db   = Database::getInstance();
        $stmt = $db->prepare("SELECT id, role_id FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return $this->json(['error' => 'Partenaire introuvable'], 404);
        }
        if ($user['role_id'] != 3) {
            return $this->json(['error' => 'Cet utilisateur n\'est pas un partenaire'], 400);
        }

        if ($this->partnerModel->delete($id)) {
            return $this->json(['message' => 'Partenaire supprimé avec succès']);
        }

        return $this->json(['error' => 'Échec de la suppression'], 500);
    }

    // ─────────────────────────────────────────────
    // AVIS / COMMENTAIRES
    // ─────────────────────────────────────────────

    /**
     * Retourne tous les avis (Admin)
     */
    public function getReviews() {
        $this->requireAdmin();

        $reviews = $this->reviewModel->all();
        return $this->json($reviews);
    }

    /**
     * Supprime un avis par son ID (Admin)
     */
    public function deleteReview($id) {
        $this->requireAdmin();

        if ($this->reviewModel->delete($id)) {
            return $this->json(['message' => 'Avis supprimé avec succès']);
        }

        return $this->json(['error' => 'Avis introuvable ou échec de la suppression'], 404);
    }
}
