<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\CategoryModel;

class CategoryController extends Controller {
    private $categoryModel;

    public function __construct() {
        $this->categoryModel = new CategoryModel();
    }

    /**
     * Retourne la liste des catégories
     */
    public function index() {
        $categories = $this->categoryModel->all();
        return $this->json($categories);
    }

    /**
     * Crée une catégorie (Admin)
     */
    public function create() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = substr($authHeader, 7);
        $userData = \App\Core\JwtHelper::decode($token);

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $data = $this->getRequestData();
        if (empty($data['slug'])) {
            $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['name'])));
        }

        if ($this->categoryModel->create($data)) {
            return $this->json(['message' => 'Catégorie créée'], 201);
        }

        return $this->json(['error' => 'Erreur lors de la création'], 500);
    }

    /**
     * Met à jour une catégorie
     */
    public function update($id) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = substr($authHeader, 7);
        $userData = \App\Core\JwtHelper::decode($token);

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $data = $this->getRequestData();
        if ($this->categoryModel->update($id, $data)) {
            return $this->json(['message' => 'Catégorie mise à jour']);
        }

        return $this->json(['error' => 'Échec de la mise à jour'], 500);
    }

    /**
     * Supprime une catégorie
     */
    public function delete($id) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = substr($authHeader, 7);
        $userData = \App\Core\JwtHelper::decode($token);

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        if ($this->categoryModel->delete($id)) {
            return $this->json(['message' => 'Catégorie supprimée']);
        }

        return $this->json(['error' => 'Échec de la suppression'], 500);
    }
}
