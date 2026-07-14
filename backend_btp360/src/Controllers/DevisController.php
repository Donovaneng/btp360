<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\DevisModel;

class DevisController extends Controller {
    private $devisModel;

    public function __construct() {
        $this->devisModel = new DevisModel();
    }

    /**
     * POST /devis - Créer une demande de devis
     */
    public function create() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $data = $this->getRequestData();

        if (empty($data['service']) || empty($data['description'])) {
            return $this->json(['error' => 'Le service et la description sont requis'], 400);
        }

        $devisData = [
            'client_id'   => $userData['user_id'],
            'partner_id'  => !empty($data['partner_id']) ? (int)$data['partner_id'] : null,
            'service'     => $data['service'],
            'description' => $data['description'],
            'budget'      => $data['budget'] ?? null,
            'deadline'    => $data['deadline'] ?? null,
            'address'     => $data['address'] ?? null,
            'phone'       => $data['phone'] ?? null
        ];

        $devisId = $this->devisModel->create($devisData);

        if ($devisId) {
            // Send email notification to partner if specified
            if (!empty($devisData['partner_id'])) {
                $partnerModel = new \App\Models\PartnerModel();
                $partner = $partnerModel->find($devisData['partner_id']);
                if ($partner && !empty($partner['email'])) {
                    $html = "
                        <h2>Nouvelle demande de devis !</h2>
                        <p>Bonjour <strong>{$partner['name']}</strong>,</p>
                        <p>Un client vient de soumettre une demande de devis sur votre profil BTP 360.</p>
                        <p><strong>Service :</strong> " . htmlspecialchars($devisData['service']) . "</p>
                        <p><strong>Description :</strong><br/>" . nl2br(htmlspecialchars($devisData['description'])) . "</p>
                        <br/>
                        <p>Connectez-vous à votre tableau de bord pour répondre.</p>
                    ";
                    \App\Core\EmailService::sendHtml($partner['email'], 'Nouvelle demande de devis - BTP 360', $html);
                }
            }

            return $this->json([
                'message' => 'Demande de devis envoyée avec succès',
                'devis_id' => $devisId
            ], 201);
        }

        return $this->json(['error' => 'Erreur lors de la création'], 500);
    }

    /**
     * GET /devis - Mes demandes de devis
     */
    public function index() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        if ($userData['role_id'] == 3) {
            $devis = $this->devisModel->findByPartner($userData['user_id']);
        } else {
            $devis = $this->devisModel->findByClient($userData['user_id']);
        }

        return $this->json($devis);
    }

    /**
     * PUT /devis/:id/status - Mettre à jour le statut
     */
    public function updateStatus($id) {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $data = $this->getRequestData();
        $status = $data['status'] ?? '';
        $allowed = ['pending', 'accepted', 'rejected', 'completed'];

        if (!in_array($status, $allowed)) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        if ($this->devisModel->updateStatus((int)$id, $status)) {
            return $this->json(['message' => 'Statut mis à jour']);
        }

        return $this->json(['error' => 'Échec de la mise à jour'], 500);
    }

    /**
     * GET /admin/devis - Tous les devis (admin uniquement)
     */
    public function adminAll() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }

        $devis = $this->devisModel->all();
        return $this->json($devis);
    }
}
