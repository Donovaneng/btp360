<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ArticleModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Liste tous les articles publiés
     */
    public function all() {
        $sql = "SELECT a.*, c.name as category_name 
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE a.is_published = 1
                ORDER BY a.created_at DESC";
        
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère un article par son ID
     */
    public function findById($id) {
        $sql = "SELECT a.*, c.name as category_name, u.name as author_name 
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE a.id = :id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère un article par son slug
     */
    public function findBySlug($slug) {
        $sql = "SELECT a.*, c.name as category_name, u.name as author_name 
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE a.slug = :slug AND a.is_published = 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['slug' => $slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Crée un nouvel article
     */
    public function create($data) {
        $sql = "INSERT INTO articles (title, slug, excerpt, content, image_url, author_id, category_id, is_published) 
                VALUES (:title, :slug, :excerpt, :content, :image_url, :author_id, :category_id, :is_published)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'image_url' => $data['image_url'] ?? null,
            'author_id' => $data['author_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'is_published' => $data['is_published'] ?? 1
        ]);

        return $result ? $this->db->lastInsertId() : false;
    }

    /**
     * Met à jour un article
     */
    public function update($id, $data) {
        $sql = "UPDATE articles SET 
                title = :title, 
                slug = :slug, 
                excerpt = :excerpt, 
                content = :content, 
                category_id = :category_id, 
                is_published = :is_published";
        
        $params = [
            'id' => $id,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'category_id' => $data['category_id'] ?? null,
            'is_published' => $data['is_published'] ?? 1
        ];

        if (!empty($data['image_url'])) {
            $sql .= ", image_url = :image_url";
            $params['image_url'] = $data['image_url'];
        }

        $sql .= " WHERE id = :id";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Supprime un article
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM articles WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
