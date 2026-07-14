<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use PDO;

class SearchController extends Controller {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Recherche globale sur toute la plateforme
     */
    public function index() {
        $q = $_GET['q'] ?? '';
        if (strlen($q) < 2) {
            return $this->json([
                'partners' => [],
                'projects' => [],
                'articles' => []
            ]);
        }

        $searchTerm = "%$q%";

        // 1. Recherche Partenaires (triés par niveau d'abonnement)
        $partnersSql = "SELECT u.id, u.name, u.company_name, u.city, u.avatar_url,
                               c.name as category_name,
                               s.level as subscription_level,
                               (SELECT COUNT(*) FROM partner_exclusivities pe WHERE pe.user_id = u.id) as is_exclusive
                        FROM users u
                        LEFT JOIN user_categories uc ON u.id = uc.user_id
                        LEFT JOIN categories c ON uc.category_id = c.id
                        LEFT JOIN subscriptions s ON u.subscription_id = s.id
                        WHERE u.role_id = 3
                        AND (u.name LIKE :q OR u.company_name LIKE :q OR u.city LIKE :q OR c.name LIKE :q)
                        ORDER BY
                            CASE COALESCE(s.level, 'standard')
                                WHEN 'exclusif' THEN 1
                                WHEN 'premium'  THEN 2
                                ELSE 3
                            END ASC,
                            u.is_verified DESC
                        LIMIT 5";
        $stmt = $this->db->prepare($partnersSql);
        $stmt->execute(['q' => $searchTerm]);
        $partners = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Recherche Projets
        $projectsSql = "SELECT p.*, u.company_name as partner_company 
                        FROM projects p 
                        JOIN users u ON p.user_id = u.id 
                        WHERE p.title LIKE :q OR p.description LIKE :q 
                        LIMIT 5";
        $stmt = $this->db->prepare($projectsSql);
        $stmt->execute(['q' => $searchTerm]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Recherche Académie
        $articlesSql = "SELECT id, title, slug, image_url, excerpt 
                         FROM articles 
                         WHERE (title LIKE :q OR content LIKE :q) AND is_published = 1 
                         LIMIT 5";
        $stmt = $this->db->prepare($articlesSql);
        $stmt->execute(['q' => $searchTerm]);
        $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $this->json([
            'partners' => $partners,
            'projects' => $projects,
            'articles' => $articles
        ]);
    }
}
