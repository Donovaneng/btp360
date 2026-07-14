<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class DevisModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($data) {
        $sql = "INSERT INTO devis (client_id, partner_id, service, description, budget, deadline, address, phone, status, created_at)
                VALUES (:client_id, :partner_id, :service, :description, :budget, :deadline, :address, :phone, 'pending', NOW())";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            'client_id'   => $data['client_id'],
            'partner_id'  => $data['partner_id'] ?? null,
            'service'     => $data['service'],
            'description' => $data['description'],
            'budget'      => $data['budget'] ?? null,
            'deadline'    => $data['deadline'] ?? null,
            'address'     => $data['address'] ?? null,
            'phone'       => $data['phone'] ?? null
        ]);
        return $result ? $this->db->lastInsertId() : false;
    }

    public function findByClient($clientId) {
        $sql = "SELECT d.*, u.name as partner_name, u.company_name as partner_company
                FROM devis d
                LEFT JOIN users u ON d.partner_id = u.id
                ORDER BY d.created_at DESC";
        $stmt = $this->db->prepare(
            "SELECT d.*, u.name as partner_name, u.company_name as partner_company
             FROM devis d
             LEFT JOIN users u ON d.partner_id = u.id
             WHERE d.client_id = :client_id
             ORDER BY d.created_at DESC"
        );
        $stmt->execute(['client_id' => $clientId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByPartner($partnerId) {
        $stmt = $this->db->prepare(
            "SELECT d.*, u.name as client_name, u.phone as client_phone, u.email as client_email
             FROM devis d
             JOIN users u ON d.client_id = u.id
             WHERE d.partner_id = :partner_id
             ORDER BY d.created_at DESC"
        );
        $stmt->execute(['partner_id' => $partnerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function all() {
        $sql = "SELECT d.*,
                       c.name as client_name, c.email as client_email,
                       p.name as partner_name, p.company_name as partner_company
                FROM devis d
                JOIN users c ON d.client_id = c.id
                LEFT JOIN users p ON d.partner_id = p.id
                ORDER BY d.created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE devis SET status = :status WHERE id = :id");
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }
}
