<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\PartnerModel;
use App\Models\ProjectModel;

class PartnerController extends Controller {
    private $partnerModel;
    private $projectModel;

    public function __construct() {
        $this->partnerModel = new PartnerModel();
        $this->projectModel = new ProjectModel();
    }

    /**
     * Retourne la liste des partenaires
     */
    public function index() {
        $partners = $this->partnerModel->all();
        return $this->json($partners);
    }

    /**
     * Retourne les détails d'un partenaire avec ses réalisations
     */
    public function show($id) {
        $partner = $this->partnerModel->find($id);

        if (!$partner) {
            return $this->json(['error' => 'Partenaire non trouvé'], 404);
        }

        $projects = $this->projectModel->findByUser($id);
        
        $partner['projects'] = $projects;

        return $this->json($partner);
    }

    /**
     * Retourne les statistiques globales publiques
     */
    public function publicStats() {
        $stats = $this->partnerModel->getGlobalStats();
        return $this->json($stats);
    }

    /**
     * Vérifier/Certifier un partenaire (Admin)
     */
    public function verify($id) {
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $data = $this->getRequestData();
        $is_verified = $data['is_verified'] ?? true;

        if ($this->partnerModel->updateVerification($id, $is_verified)) {
            return $this->json(['message' => 'Statut partenaire mis à jour']);
        }

        return $this->json(['error' => 'Échec de la mise à jour'], 500);
    }
}
