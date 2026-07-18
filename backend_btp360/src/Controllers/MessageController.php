<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\MessageModel;

class MessageController extends Controller {
    private $messageModel;

    public function __construct() {
        $this->messageModel = new MessageModel();
    }

    /**
     * POST /messages - Envoyer un message
     */
    public function send() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $data = $this->getRequestData();
        $receiverId = isset($data['receiver_id']) ? (int)$data['receiver_id'] : 0;
        $messageText = trim($data['message'] ?? '');

        if ($receiverId <= 0 || empty($messageText)) {
            return $this->json(['error' => 'Interlocuteur et message requis'], 400);
        }

        // Enregistrer en BD
        $success = $this->messageModel->create($userData['user_id'], $receiverId, $messageText);
        if ($success) {
            return $this->json([
                'message' => 'Message envoyé',
                'data' => [
                    'sender_id' => $userData['user_id'],
                    'receiver_id' => $receiverId,
                    'message' => $messageText,
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ], 201);
        }

        return $this->json(['error' => "Échec de l'enregistrement du message"], 500);
    }

    /**
     * GET /messages/conversation/(\d+) - Récupérer l'historique avec un utilisateur
     */
    public function getConversation($receiverId) {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $receiverId = (int)$receiverId;
        if ($receiverId <= 0) {
            return $this->json(['error' => 'ID interlocuteur invalide'], 400);
        }

        $history = $this->messageModel->getChatHistory($userData['user_id'], $receiverId);
        return $this->json($history, 200);
    }

    /**
     * GET /messages/conversations - Obtenir la liste des conversations actives
     */
    public function getConversations() {
        $userData = $this->getAuthenticatedUser();
        if (!$userData) {
            return $this->json(['error' => 'Non autorisé'], 401);
        }

        $conversations = $this->messageModel->getConversationsList($userData['user_id']);
        return $this->json($conversations, 200);
    }
}
