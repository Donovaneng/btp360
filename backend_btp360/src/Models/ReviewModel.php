<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ReviewModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Récupère tous les avis avec les informations client et partenaire (Admin)
     */
    public function all() {
        $sql = "SELECT r.id, r.rating, r.comment, r.created_at,
                       u_client.name  AS client_name,
                       u_client.email AS client_email,
                       u_partner.name AS partner_name,
                       u_partner.company_name AS partner_company,
                       u_partner.id   AS partner_id
                FROM reviews r
                JOIN users u_client  ON u_client.id  = r.client_id
                JOIN users u_partner ON u_partner.id = r.partner_id
                ORDER BY r.created_at DESC";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère les avis d'un partenaire spécifique
     */
    public function findByPartner($partnerId) {
        $sql = "SELECT r.*, u.name AS client_name, u.avatar_url AS client_avatar
                FROM reviews r
                JOIN users u ON u.id = r.client_id
                WHERE r.partner_id = :partner_id
                ORDER BY r.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['partner_id' => $partnerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Supprime un avis par son ID (Admin)
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM reviews WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Compte le total des avis
     */
    public function count() {
        return (int) $this->db->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
    }
}
