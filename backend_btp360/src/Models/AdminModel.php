<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class AdminModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Récupère les compteurs globaux pour le tableau de bord
     */
    public function getCounters() {
        $stats = [];
        
        // Total Partenaires
        $stats['totalPartners'] = $this->db->query("SELECT COUNT(*) FROM users WHERE role_id = 3")->fetchColumn();
        
        // Total Clients
        $stats['totalClients'] = $this->db->query("SELECT COUNT(*) FROM users WHERE role_id = 2")->fetchColumn();
        
        // Total Projets
        $stats['totalProjects'] = $this->db->query("SELECT COUNT(*) FROM projects")->fetchColumn();
        
        // Total Leads
        $stats['totalLeads'] = $this->db->query("SELECT COUNT(*) FROM leads")->fetchColumn();
        
        // Leads par statut
        $stmt = $this->db->query("SELECT status, COUNT(*) as count FROM leads GROUP BY status");
        $stats['leadsBreakdown'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Revenu estimé (Simulation basée sur les projets terminés)
        // Supposons une commission fixe pour l'exemple
        $stats['estimatedRevenue'] = $this->db->query("SELECT COUNT(*) * 50000 FROM projects")->fetchColumn();

        return $stats;
    }

    /**
     * Récupère les derniers événements système
     */
    public function getRecentActivity() {
        // Pour l'instant on simule en récupérant les derniers inscrits et derniers projets
        $sql = "(SELECT name as title, 'user' as type, created_at FROM users ORDER BY created_at DESC LIMIT 5)
                UNION
                (SELECT title, 'project' as type, created_at FROM projects ORDER BY created_at DESC LIMIT 5)
                UNION
                (SELECT service_requested as title, 'lead' as type, created_at FROM leads ORDER BY created_at DESC LIMIT 5)
                ORDER BY created_at DESC LIMIT 15";
        
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère l'historique des leads sur les 7 derniers jours
     */
    public function getLeadsHistory() {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $sql = "SELECT COUNT(*) FROM leads WHERE DATE(created_at) = :date";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['date' => $date]);
            $count = $stmt->fetchColumn();
            
            $data[] = [
                'day' => date('D', strtotime($date)),
                'count' => (int)$count
            ];
        }
        return $data;
    }
}
