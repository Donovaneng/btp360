<?php

namespace App\Models;

use PDO;

/**
 * Modèle pour la gestion des demandes de projets (Leads)
 */
class LeadModel {
    private $pdo;

    public function __construct() {
        $this->pdo = \App\Core\Database::getInstance();
    }

    /**
     * Enregistre une nouvelle demande dans la base de données
     * @param array $data Les données du lead
     * @return bool|string L'ID du lead créé ou false
     */
    public function create($data) {
        $sql = "INSERT INTO leads (client_id, partner_id, service_requested, message, status, created_at) 
                VALUES (:client_id, :partner_id, :service_requested, :message, 'pending', NOW())";
        
        $stmt = $this->pdo->prepare($sql);
        
        $result = $stmt->execute([
            'client_id' => $data['client_id'],
            'partner_id' => $data['partner_id'],
            'service_requested' => $data['service_requested'] ?? null,
            'message' => $data['message'] ?? null
        ]);

        return $result ? $this->pdo->lastInsertId() : false;
    }

    /**
     * Récupère les demandes pour un partenaire spécifique
     */
    public function findByPartner($partner_id) {
        $sql = "SELECT l.*, u.name as client_name, u.email as client_email, u.phone as client_phone 
                FROM leads l 
                LEFT JOIN users u ON l.client_id = u.id 
                WHERE l.partner_id = :partner_id 
                ORDER BY l.created_at DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['partner_id' => $partner_id]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère les demandes envoyées par un client
     */
    public function findByClient($client_id) {
        $sql = "SELECT l.*, u.name as partner_name, u.company_name as partner_company, u.email as partner_email, u.phone as partner_phone
                FROM leads l 
                LEFT JOIN users u ON l.partner_id = u.id 
                WHERE l.client_id = :client_id 
                ORDER BY l.created_at DESC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['client_id' => $client_id]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Met à jour le statut d'une demande
     */
    public function updateStatus($lead_id, $status, $partner_id = null) {
        return $this->updateStatusWithUserCheck($lead_id, $status, $partner_id, 'partner_id');
    }

    /**
     * Mise à jour de statut avec vérification de propriété (Admin, Partenaire ou Client)
     */
    public function updateStatusWithUserCheck($lead_id, $status, $user_id, $checkField = null) {
        $sql = "UPDATE leads SET status = :status WHERE id = :id";
        $params = ['status' => $status, 'id' => $lead_id];

        if ($checkField !== null) {
            $sql .= " AND $checkField = :user_id";
            $params['user_id'] = $user_id;
        }

        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Récupère toutes les demandes (Admin)
     */
    public function all() {
        $sql = "SELECT l.*, 
                       c.name as client_name, c.email as client_email, 
                       p.name as partner_name, p.company_name as partner_company
                FROM leads l 
                LEFT JOIN users c ON l.client_id = c.id 
                LEFT JOIN users p ON l.partner_id = p.id 
                ORDER BY l.created_at DESC";
        
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
