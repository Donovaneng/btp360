<?php

namespace App\Core;

/**
 * Classe de base pour tous les contrôleurs
 */
abstract class Controller {
    
    /**
     * Envoie une réponse JSON standardisée
     */
    protected function json($data, $status = 200) {
        // Nettoyer tout tampon de sortie pour éviter que des warnings ne corrompent le JSON
        if (ob_get_length()) ob_clean();
        
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    /**
     * Récupère les données envoyées en JSON (POST/PUT)
     */
    protected function getRequestData() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // On s'assure de toujours renvoyer un tableau, même si le format est invalide
        return is_array($data) ? $data : [];
    }

    /**
     * Récupère l'utilisateur authentifié via le token JWT
     */
    protected function getAuthenticatedUser() {
        // Méthode plus robuste pour récupérer le header Authorization
        $authHeader = '';
        
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (empty($authHeader)) return null;

        // On vérifie que le header commence par "Bearer "
        if (strpos($authHeader, 'Bearer ') !== 0) {
            return null;
        }

        $token = substr($authHeader, 7);
        return \App\Core\JwtHelper::decode($token);
    }
}
