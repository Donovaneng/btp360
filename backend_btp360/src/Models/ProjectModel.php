<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ProjectModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Liste tous les projets avec les noms des entreprises
     */
    public function all() {
        $sql = "SELECT p.*, u.company_name, u.name as partner_name, 
                       c.id as category_id, c.name as category_name
                FROM projects p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN user_categories uc ON u.id = uc.user_id
                LEFT JOIN categories c ON uc.category_id = c.id
                ORDER BY p.completion_date DESC";
        
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère les projets d'un utilisateur spécifique
     */
    public function findByUser($user_id) {
        $sql = "SELECT * FROM projects WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Crée un nouveau projet
     */
    public function create($data) {
        $sql = "INSERT INTO projects (user_id, title, description, image_url, completion_date, created_at) 
                VALUES (:user_id, :title, :description, :image_url, :completion_date, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            'user_id' => $data['user_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'completion_date' => $data['completion_date'] ?? null
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Supprime un projet
     */
    public function delete($id, $user_id) {
        $sql = "DELETE FROM projects WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'user_id' => $user_id]);
    }

    /**
     * Met à jour un projet
     */
    public function update($id, $user_id, $data) {
        $sql = "UPDATE projects SET 
                title = :title, 
                description = :description, 
                completion_date = :completion_date";
        
        $params = [
            'id' => $id,
            'user_id' => $user_id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'completion_date' => $data['completion_date'] ?? null
        ];

        if (!empty($data['image_url'])) {
            $sql .= ", image_url = :image_url";
            $params['image_url'] = $data['image_url'];
        }

        $sql .= " WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
}
