<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\JwtHelper;

class UploadController extends Controller {

    /**
     * Gère l'upload d'une image de projet
     */
    public function uploadProjectImage() {
        // 1. Vérification de l'authentification
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 3) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        // 2. Vérification du fichier
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return $this->json(['error' => 'Aucun fichier reçu ou erreur lors du transfert'], 400);
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5 Mo

        if (!in_array($file['type'], $allowedTypes)) {
            return $this->json(['error' => 'Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.'], 400);
        }

        if ($file['size'] > $maxSize) {
            return $this->json(['error' => 'Fichier trop volumineux (max 5 Mo).'], 400);
        }

        // 3. Préparation du stockage
        $uploadDir = __DIR__ . '/../../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];
        $extension = $mimeMap[$file['type']] ?? 'jpg';
        $filename = uniqid('project_') . '_' . time() . '.' . $extension;
        $targetPath = $uploadDir . $filename;

        // 4. Déplacement du fichier
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // URL relative pour le frontend (en utilisant la constante globale)
            $fileUrl = UPLOAD_URL . $filename;
            
            return $this->json([
                'message' => 'Upload réussi',
                'url' => $fileUrl
            ]);
        } else {
            return $this->json(['error' => 'Échec de la sauvegarde du fichier sur le serveur.'], 500);
        }
    }

    /**
     * Gère l'upload d'une image d'article (Admin)
     */
    public function uploadArticleImage() {
        $userData = $this->getAuthenticatedUser();

        if (!$userData || $userData['role_id'] != 1) {
            return $this->json(['error' => 'Accès non autorisé'], 403);
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return $this->json(['error' => 'Aucun fichier reçu'], 400);
        }

        $file = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $maxSize = 5 * 1024 * 1024;

        if (!in_array($file['type'], $allowedTypes)) {
            return $this->json(['error' => 'Format non supporté'], 400);
        }

        if ($file['size'] > $maxSize) {
            return $this->json(['error' => 'Fichier trop volumineux'], 400);
        }

        $uploadDir = __DIR__ . '/../../uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $mimeMap = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        ];
        $extension = $mimeMap[$file['type']] ?? 'jpg';
        $filename = uniqid('article_') . '_' . time() . '.' . $extension;
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $this->json([
                'message' => 'Upload réussi',
                'url' => UPLOAD_URL . $filename
            ]);
        }
        return $this->json(['error' => 'Échec sauvegarde'], 500);
    }
}
