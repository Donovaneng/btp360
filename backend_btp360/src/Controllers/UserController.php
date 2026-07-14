<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Contrôleur exemple pour les utilisateurs
 */
class UserController extends Controller {
    
    /**
     * Test de l'API
     */
    public function index() {
        return $this->json([
            'message' => 'Liste des utilisateurs (Route gérée par UserController)',
            'status' => 'success'
        ]);
    }

    /**
     * Test de santé
     */
    public function health() {
        return $this->json([
            'status' => 'ok',
            'timestamp' => time(),
            'service' => 'BTP 360 API'
        ]);
    }
}
