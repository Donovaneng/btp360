<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\LeadModel;
use App\Core\JwtHelper;

class LeadController extends Controller {
    private $leadModel;

    public function __construct() {
        $this->leadModel = new LeadModel();
    }

    /**
     * Crée une nouvelle demande de projet
     */
    public function create() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        // 2. Récupération des données
        $data = $this->getRequestData();

        if (empty($data['partner_id']) || empty($data['message'])) {
            return $this->json(['error' => 'Tous les champs (identifiant partenaire et message) sont requis'], 400);
        }

        // 3. Préparation du lead
        $leadData = [
            'client_id' => $userData['user_id'],
            'partner_id' => $data['partner_id'],
            'service_requested' => $data['service'] ?? 'Demande générale',
            'message' => $data['message']
        ];

        // 4. Enregistrement
        $leadId = $this->leadModel->create($leadData);

        if ($leadId) {
            // Envoyer un email de notification au partenaire
            $partnerModel = new \App\Models\PartnerModel();
            $partner = $partnerModel->find($data['partner_id']);
            
            if ($partner && !empty($partner['email'])) {
                $html = "
                    <h2>Vous avez reçu un nouveau prospect !</h2>
                    <p>Bonjour <strong>{$partner['name']}</strong>,</p>
                    <p>Bonne nouvelle ! Un client potentiel vient de faire une demande sur votre profil BTP 360.</p>
                    <p><strong>Service demandé :</strong> " . htmlspecialchars($leadData['service_requested']) . "</p>
                    <p><strong>Message :</strong><br/>" . nl2br(htmlspecialchars($leadData['message'])) . "</p>
                    <br/>
                    <p>Connectez-vous rapidement à votre tableau de bord partenaire pour ne pas rater cette opportunité.</p>
                    <p style='text-align:center; margin-top:30px;'>
                        <a href='" . APP_URL . "/login' class='btn' style='background-color:#ff6b00;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;'>Voir la demande</a>
                    </p>
                ";
                \App\Core\EmailService::sendHtml($partner['email'], 'Nouvelle demande sur BTP 360', $html);
            }

            return $this->json([
                'message' => 'Demande envoyée avec succès',
                'lead_id' => $leadId
            ], 201);
        } else {
            return $this->json(['error' => 'Erreur lors de l\'enregistrement de la demande'], 500);
        }
    }

    /**
     * Liste les leads pour l'utilisateur connecté (Client ou Partenaire)
     */
    public function index() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        if ($userData['role_id'] == 2) {
            // Client
            $leads = $this->leadModel->findByClient($userData['user_id']);
        } else {
            // Partenaire
            $leads = $this->leadModel->findByPartner($userData['user_id']);
        }

        return $this->json($leads);
    }

    /**
     * Met à jour le statut d'une demande par le partenaire
     */
    public function updateStatus($id) {
        $userData = $this->getAuthenticatedUser();
        if (!$userData || !in_array($userData['role_id'], [1, 2, 3])) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $data = $this->getRequestData();
        $status = $data['status'] ?? '';

        // Role-specific restrictions
        if ($userData['role_id'] == 2 && $status !== 'cancelled') {
            return $this->json(['error' => 'Les clients ne peuvent que annuler une demande'], 400);
        }

        $allowedStatus = ['pending', 'contacted', 'completed', 'cancelled'];
        if (!in_array($status, $allowedStatus)) {
            return $this->json(['error' => 'Statut invalide'], 400);
        }

        // If Admin (role 1), we don't check owner_id
        // If Partner (role 3), we check partner_id
        // If Client (role 2), we check client_id
        $checkField = null;
        if ($userData['role_id'] == 3) $checkField = 'partner_id';
        if ($userData['role_id'] == 2) $checkField = 'client_id';

        if ($this->leadModel->updateStatusWithUserCheck($id, $status, $userData['user_id'], $checkField)) {
            return $this->json(['message' => 'Statut mis à jour']);
        }

        return $this->json(['error' => 'Échec de la mise à jour'], 500);
    }

    /**
     * Liste tous les leads (Admin uniquement)
     */
    public function adminAll() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Non autorisé'], 403);
        }

        $leads = $this->leadModel->all();
        return $this->json($leads);
    }
}
