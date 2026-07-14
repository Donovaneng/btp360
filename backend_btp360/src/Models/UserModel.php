<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class UserModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Trouve un utilisateur par son email
     */
    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    /**
     * Crée un nouvel utilisateur
     */
    public function create($data) {
        $sql = "INSERT INTO users (role_id, name, email, password, phone, company_name, city) 
                VALUES (:role_id, :name, :email, :password, :phone, :company_name, :city)";
        
        $stmt = $this->db->prepare($sql);
        
        $stmt->execute([
            'role_id'      => $data['role_id'],
            'name'         => $data['name'],
            'email'        => $data['email'],
            'password'     => password_hash($data['password'], PASSWORD_BCRYPT),
            'phone'        => $data['phone'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'city'         => $data['city'] ?? null
        ]);

        $userId = $this->db->lastInsertId();

        // Lier la catégorie de métier si fournie (partenaires)
        if (!empty($data['category_id']) && is_numeric($data['category_id'])) {
            $stmt2 = $this->db->prepare(
                "INSERT IGNORE INTO user_categories (user_id, category_id) VALUES (?, ?)"
            );
            $stmt2->execute([$userId, (int)$data['category_id']]);
        }

        return $userId;
    }

    /**
     * Supprime un utilisateur par son ID
     * Les leads, projets et user_categories sont supprimés en cascade par la BDD
     */
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Met à jour les informations d'un utilisateur
     */
    public function update($id, $data) {
        $allowedFields = ['name', 'company_name', 'city', 'phone', 'avatar_url', 'bio'];
        $updates = [];
        $params = ['id' => $id];

        foreach ($data as $key => $value) {
            if (in_array($key, $allowedFields)) {
                $updates[] = "$key = :$key";
                $params[$key] = $value;
            }
        }

        if (empty($updates)) return false;

        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute($params);

        // Mettre à jour la catégorie si fournie
        if (!empty($data['category_id']) && is_numeric($data['category_id'])) {
            $this->db->prepare("DELETE FROM user_categories WHERE user_id = ?")->execute([$id]);
            $this->db->prepare("INSERT IGNORE INTO user_categories (user_id, category_id) VALUES (?, ?)")
                      ->execute([$id, (int)$data['category_id']]);
        }

        return $result;
    }
}
