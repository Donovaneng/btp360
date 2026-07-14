<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\FavoriteModel;

class FavoriteController extends Controller {
    private $favoriteModel;

    public function __construct() {
        $this->favoriteModel = new FavoriteModel();
    }

    /**
     * GET /favorites
     * Retourne la liste des partenaires favoris de l'utilisateur connecté
     */
    public function index() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $favorites = $this->favoriteModel->findByUser($userData['user_id']);
        return $this->json($favorites);
    }

    /**
     * GET /favorites/check/:partner_id
     * Vérifie si un partenaire est en favori
     */
    public function check($partnerId) {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['is_favorite' => false]);
        }

        $isFav = $this->favoriteModel->exists($userData['user_id'], (int)$partnerId);
        return $this->json(['is_favorite' => $isFav]);
    }

    /**
     * POST /favorites/toggle
     * Ajoute ou retire un partenaire des favoris
     */
    public function toggle() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $data = $this->getRequestData();
        $partnerId = (int)($data['partner_id'] ?? 0);

        if (!$partnerId) {
            return $this->json(['error' => 'ID partenaire requis'], 400);
        }

        $isNowFavorite = $this->favoriteModel->toggle($userData['user_id'], $partnerId);

        return $this->json([
            'is_favorite' => $isNowFavorite,
            'message' => $isNowFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
        ]);
    }

    /**
     * DELETE /favorites/:partner_id
     * Retire un partenaire spécifique des favoris
     */
    public function remove($partnerId) {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $this->favoriteModel->remove($userData['user_id'], (int)$partnerId);
        return $this->json(['message' => 'Retiré des favoris', 'is_favorite' => false]);
    }
}
