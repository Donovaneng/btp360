<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class CategoryModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Liste toutes les catégories
     */
    public function all() {
        $stmt = $this->db->query("SELECT * FROM categories ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    /**
     * Crée une catégorie
     */
    public function create($data) {
        $sql = "INSERT INTO categories (name, slug, description, icon_name) VALUES (:name, :slug, :description, :icon_name)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'icon_name' => $data['icon_name'] ?? 'Building'
        ]);
    }

    /**
     * Met à jour une catégorie
     */
    public function update($id, $data) {
        $sql = "UPDATE categories SET name = :name, slug = :slug, description = :description, icon_name = :icon_name WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'icon_name' => $data['icon_name'] ?? 'Building'
        ]);
    }

    /**
     * Supprime une catégorie
     */
    public function delete($id) {
        $sql = "DELETE FROM categories WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}
