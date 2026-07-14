<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\ProjectModel;

class ProjectController extends Controller {
    private $projectModel;

    public function __construct() {
        $this->projectModel = new ProjectModel();
    }

    /**
     * Retourne la liste globale des projets
     */
    public function index() {
        $projects = $this->projectModel->all();
        return $this->json($projects);
    }

    /**
     * Retourne un projet spécifique par ID
     */
    public function show($id) {
        $db = \App\Core\Database::getInstance();
        $stmt = $db->prepare("
            SELECT p.*, u.company_name, u.name as partner_name,
                   c.name as category_name
            FROM projects p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN user_categories uc ON u.id = uc.user_id
            LEFT JOIN categories c ON uc.category_id = c.id
            WHERE p.id = ?
        ");
        $stmt->execute([(int)$id]);
        $project = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$project) {
            return $this->json(['error' => 'Projet non trouvé'], 404);
        }

        return $this->json($project);
    }

    /**
     * Retourne les projets de l'utilisateur connecté
     */
    public function myProjects() {
        $userData = $this->getAuthenticatedUser();

        if (!$userData) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $projects = $this->projectModel->findByUser($userData['user_id']);
        return $this->json($projects);
    }

    /**
     * Crée une nouvelle réalisation (Projet)
     */
    public function create() {
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 3) {
            return $this->json(['error' => 'Seuls les partenaires peuvent publier des projets'], 403);
        }

        $data = $this->getRequestData();

        if (empty($data['title'])) {
            return $this->json(['error' => 'Le titre du projet est requis'], 400);
        }

        $projectData = [
            'user_id' => $userData['user_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'image_url' => $data['image_url'] ?? null,
            'completion_date' => $data['completion_date'] ?? null
        ];

        $projectId = $this->projectModel->create($projectData);

        if ($projectId) {
            return $this->json([
                'message' => 'Projet publié avec succès',
                'project_id' => $projectId
            ], 201);
        } else {
            return $this->json(['error' => 'Erreur lors de la publication'], 500);
        }
    }

    /**
     * Met à jour un projet existant
     */
    public function update($id) {
        $userData = $this->getAuthenticatedUser();

        if (!$userData) return $this->json(['error' => 'Non autorisé'], 401);

        $data = $this->getRequestData();
        if ($this->projectModel->update($id, $userData['user_id'], $data)) {
            return $this->json(['message' => 'Projet mis à jour']);
        }

        return $this->json(['error' => 'Échec de la mise à jour ou non autorisé'], 500);
    }

    /**
     * Supprime un projet
     */
    public function delete($id) {
        $userData = $this->getAuthenticatedUser();

        if (!$userData) return $this->json(['error' => 'Non autorisé'], 401);

        if ($this->projectModel->delete($id, $userData['user_id'])) {
            return $this->json(['message' => 'Projet supprimé']);
        }

        return $this->json(['error' => 'Échec de la suppression ou non autorisé'], 500);
    }
}
