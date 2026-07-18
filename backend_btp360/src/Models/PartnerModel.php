<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class PartnerModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Liste tous les partenaires triés par niveau d'abonnement (exclusif > premium > standard)
     */
    public function all() {
        $sql = "SELECT u.id, u.name, u.email, u.company_name, u.city, u.phone, u.avatar_url, u.is_verified,
                       c.name as category_name, c.slug as category_slug,
                       s.level as subscription_level,
                       (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) as projects_count,
                       (SELECT COUNT(*) FROM partner_exclusivities pe WHERE pe.user_id = u.id) as is_exclusive,
                       (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as avg_rating,
                       (SELECT COUNT(*) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as reviews_count
                FROM users u
                LEFT JOIN user_categories uc ON u.id = uc.user_id
                LEFT JOIN categories c ON uc.category_id = c.id
                LEFT JOIN subscriptions s ON u.subscription_id = s.id
                WHERE u.role_id = 3
                ORDER BY
                    CASE COALESCE(s.level, 'standard')
                        WHEN 'exclusif' THEN 1
                        WHEN 'premium'  THEN 2
                        ELSE 3
                    END ASC,
                    u.is_verified DESC,
                    u.name ASC";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Liste les partenaires par catégorie triés par niveau d'abonnement
     */
    public function byCategory($slug) {
        $sql = "SELECT u.id, u.name, u.email, u.company_name, u.city, u.phone, u.avatar_url, u.is_verified,
                       c.name as category_name, c.slug as category_slug,
                       s.level as subscription_level,
                       (SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id) as projects_count,
                       (SELECT COUNT(*) FROM partner_exclusivities pe WHERE pe.user_id = u.id) as is_exclusive,
                       (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as avg_rating,
                       (SELECT COUNT(*) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as reviews_count
                FROM users u
                JOIN user_categories uc ON u.id = uc.user_id
                JOIN categories c ON uc.category_id = c.id
                LEFT JOIN subscriptions s ON u.subscription_id = s.id
                WHERE u.role_id = 3 AND c.slug = :slug
                ORDER BY
                    CASE COALESCE(s.level, 'standard')
                        WHEN 'exclusif' THEN 1
                        WHEN 'premium'  THEN 2
                        ELSE 3
                    END ASC,
                    u.is_verified DESC,
                    u.name ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['slug' => $slug]);
        return $stmt->fetchAll();
    }
    /**
     * Récupère un partenaire spécifique par son ID
     */

    public function find($id) {
        
        $sql = "SELECT u.id, u.name, u.email, u.company_name, u.city, u.phone, u.avatar_url, u.is_verified, u.bio,
                       c.name as category_name, c.slug as category_slug,
                       s.level as subscription_level,
                       (SELECT COUNT(*) FROM partner_exclusivities pe WHERE pe.user_id = u.id) as is_exclusive,
                       (SELECT ROUND(AVG(r.rating),1) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as avg_rating,
                       (SELECT COUNT(*) FROM reviews r WHERE r.partner_id = u.id AND r.status = 'approved') as reviews_count
                FROM users u
                LEFT JOIN user_categories uc ON u.id = uc.user_id
                LEFT JOIN categories c ON uc.category_id = c.id
                LEFT JOIN subscriptions s ON u.subscription_id = s.id
                WHERE u.role_id = 3 AND u.id = :id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Met à jour le statut de vérification (Admin)
     */
    public function updateVerification($id, $is_verified) {
        $sql = "UPDATE users SET is_verified = :is_verified WHERE id = :id AND role_id = 3";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'is_verified' => $is_verified ? 1 : 0]);
    }
    /**
     * Supprime un partenaire (et toutes ses données liées via CASCADE)
     */
    public function delete($id) {
        // Supprimer les exclusivités d'abord si la table existe
        try {
            $this->db->prepare("DELETE FROM partner_exclusivities WHERE user_id = :id")->execute(['id' => $id]);
        } catch (\Exception $e) {
            // Table peut ne pas exister, on continue
        }
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id AND role_id = 3");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Récupère les statistiques globales publiques
     */
    public function getGlobalStats() {
        // Compter les partenaires
        $sqlPartners = "SELECT COUNT(*) as count FROM users WHERE role_id = 3";
        $partnersCount = $this->db->query($sqlPartners)->fetchColumn();

        // Compter les projets
        $sqlProjects = "SELECT COUNT(*) as count FROM projects";
        $projectsCount = $this->db->query($sqlProjects)->fetchColumn();

        // Compter les villes uniques
        $sqlCities = "SELECT COUNT(DISTINCT city) as count FROM users WHERE role_id = 3 AND city IS NOT NULL";
        $citiesCount = $this->db->query($sqlCities)->fetchColumn();

        return [
            'partners' => (int)$partnersCount,
            'projects' => (int)$projectsCount,
            'cities' => (int)$citiesCount,
            'experience' => 12 // Statique pour le moment
        ];
    }
}
