<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use PDO;

class ReviewController extends Controller {

    /**
     * GET /reviews/{partner_id}
     * Récupère les avis d'un partenaire
     */
    public function index($partnerId) {
        $db = Database::getInstance();

        $stmt = $db->prepare("
            SELECT r.*, u.name as client_name, u.avatar_url as client_avatar
            FROM reviews r
            JOIN users u ON u.id = r.client_id
            WHERE r.partner_id = ? AND r.status = 'approved'
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([(int)$partnerId]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculer la note moyenne
        $avg = count($reviews) > 0
            ? round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1)
            : 0;

        return $this->json([
            'reviews' => $reviews,
            'average' => $avg,
            'count'   => count($reviews)
        ]);
    }

    /**
     * POST /reviews
     * Créer un nouvel avis (client connecté uniquement)
     */
    public function create() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Vous devez être connecté pour laisser un avis'], 401);
        }

        $data = $this->getRequestData();
        $partnerId = (int)($data['partner_id'] ?? 0);
        $rating    = (int)($data['rating'] ?? 0);
        $comment   = trim($data['comment'] ?? '');

        if (!$partnerId || $rating < 1 || $rating > 5 || empty($comment)) {
            return $this->json(['error' => 'Données invalides (note 1-5 et commentaire requis)'], 400);
        }

        $db = Database::getInstance();

        // Vérifier que le partenaire existe
        $stmt = $db->prepare("SELECT id FROM users WHERE id = ? AND role_id = 3");
        $stmt->execute([$partnerId]);
        if (!$stmt->fetch()) {
            return $this->json(['error' => 'Partenaire introuvable'], 404);
        }

        // Un client ne peut laisser qu'un seul avis par partenaire
        $stmt = $db->prepare("SELECT id FROM reviews WHERE client_id = ? AND partner_id = ?");
        $stmt->execute([$userData['user_id'], $partnerId]);
        if ($stmt->fetch()) {
            return $this->json(['error' => 'Vous avez déjà laissé un avis pour ce partenaire'], 409);
        }

        // Insérer l'avis
        $db->prepare("INSERT INTO reviews (client_id, partner_id, rating, comment) VALUES (?, ?, ?, ?)")
           ->execute([$userData['user_id'], $partnerId, $rating, $comment]);

        return $this->json(['message' => 'Avis publié avec succès'], 201);
    }
}
