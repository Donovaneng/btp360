<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\ArticleModel;

class ArticleController extends Controller {
    private $articleModel;

    public function __construct() {
        $this->articleModel = new ArticleModel();
    }

    /**
     * Liste des articles
     */
    public function index() {
        $articles = $this->articleModel->all();
        return $this->json($articles);
    }

    /**
     * Voir un article
     */
    public function show($identifier) {
        if (is_numeric($identifier)) {
            $article = $this->articleModel->findById($identifier);
        } else {
            $article = $this->articleModel->findBySlug($identifier);
        }
        
        if (!$article) {
            return $this->json(['error' => 'Article non trouvé'], 404);
        }
        return $this->json($article);
    }

    /**
     * Crée un article (Admin uniquement)
     */
    public function create() {
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $data = $this->getRequestData();
        $data['author_id'] = $userData['user_id'];
        
        // Simple slug generation if not provided
        if (empty($data['slug'])) {
            $data['slug'] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title'])));
        }

        $id = $this->articleModel->create($data);
        if ($id) {
            return $this->json(['message' => 'Article créé', 'id' => $id], 201);
        }

        return $this->json(['error' => 'Plus d info requis ou erreur SQL'], 400);
    }

    /**
     * Met à jour un article
     */
    public function update($id) {
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $data = $this->getRequestData();
        if ($this->articleModel->update($id, $data)) {
            return $this->json(['message' => 'Article mis à jour']);
        }

        return $this->json(['error' => 'Échec de la mise à jour'], 500);
    }

    /**
     * Supprime un article
     */
    public function delete($id) {
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        if ($this->articleModel->delete($id)) {
            return $this->json(['message' => 'Article supprimé']);
        }

        return $this->json(['error' => 'Échec de la suppression'], 500);
    }
}
