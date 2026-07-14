<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\UserModel;
use App\Core\JwtHelper;

class AuthController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new UserModel();
    }

    /**
     * Inscription d'un utilisateur
     */
    public function register() {
        $data = $this->getRequestData();

        // Validation basique
        if (empty($data['email']) || empty($data['password']) || empty($data['name']) || empty($data['role_id'])) {
            return $this->json(['error' => 'Champs obligatoires manquants'], 400);
        }

        // Vérifier si l'utilisateur existe déjà
        if ($this->userModel->findByEmail($data['email'])) {
            return $this->json(['error' => 'Cet email est déjà utilisé'], 409);
        }

        try {
            $userId = $this->userModel->create($data);
            return $this->json([
                'message' => 'Utilisateur créé avec succès',
                'user_id' => $userId
            ], 201);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la création : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Connexion d'un utilisateur
     */
    public function login() {
        try {
            $data = $this->getRequestData();

            if (empty($data['email']) || empty($data['password'])) {
                return $this->json(['error' => 'Email et mot de passe requis'], 400);
            }

            $user = $this->userModel->findByEmail($data['email']);

            if (!$user || !password_verify($data['password'], $user['password'])) {
                return $this->json(['error' => 'Identifiants invalides'], 401);
            }

            // Génération du Token
            $token = JwtHelper::encode([
                'user_id' => $user['id'],
                'role_id' => $user['role_id'],
                'email' => $user['email'],
                'exp' => time() + (3600 * 24) // 24 heures
            ]);

            return $this->json([
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role_id' => $user['role_id']
                ]
            ]);
        } catch (\Exception $e) {
            error_log("Login Exception: " . $e->getMessage());
            return $this->json(['error' => 'Une erreur interne est survenue lors de la connexion'], 500);
        }
    }
}
