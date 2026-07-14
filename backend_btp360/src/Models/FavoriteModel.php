<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class FavoriteModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Récupère tous les partenaires favoris d'un utilisateur
     */
    public function findByUser($userId) {
        $sql = "SELECT u.id, u.name, u.email, u.company_name, u.city, u.phone, u.avatar_url, u.is_verified,
                       c.name as category_name, c.slug as category_slug,
                       s.level as subscription_level,
                       (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) as projects_count,
                       f.created_at as favorited_at
                FROM favorites f
                JOIN users u ON u.id = f.partner_id
                LEFT JOIN user_categories uc ON u.id = uc.user_id
                LEFT JOIN categories c ON uc.category_id = c.id
                LEFT JOIN subscriptions s ON u.subscription_id = s.id
                WHERE f.user_id = :user_id
                ORDER BY f.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Vérifie si un partenaire est en favori pour un utilisateur
     */
    public function exists($userId, $partnerId) {
        $stmt = $this->db->prepare(
            "SELECT id FROM favorites WHERE user_id = :user_id AND partner_id = :partner_id"
        );
        $stmt->execute(['user_id' => $userId, 'partner_id' => $partnerId]);
        return (bool) $stmt->fetch();
    }

    /**
     * Ajoute un favori
     */
    public function add($userId, $partnerId) {
        $stmt = $this->db->prepare(
            "INSERT IGNORE INTO favorites (user_id, partner_id) VALUES (:user_id, :partner_id)"
        );
        return $stmt->execute(['user_id' => $userId, 'partner_id' => $partnerId]);
    }

    /**
     * Supprime un favori
     */
    public function remove($userId, $partnerId) {
        $stmt = $this->db->prepare(
            "DELETE FROM favorites WHERE user_id = :user_id AND partner_id = :partner_id"
        );
        return $stmt->execute(['user_id' => $userId, 'partner_id' => $partnerId]);
    }

    /**
     * Toggle favori - ajoute ou retire selon l'état actuel
     * Retourne true si ajouté, false si retiré
     */
    public function toggle($userId, $partnerId) {
        if ($this->exists($userId, $partnerId)) {
            $this->remove($userId, $partnerId);
            return false;
        } else {
            $this->add($userId, $partnerId);
            return true;
        }
    }
}
