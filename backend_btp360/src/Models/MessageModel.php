<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class MessageModel {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    /**
     * Enregistrer un nouveau message
     */
    public function create($senderId, $receiverId, $message) {
        $sql = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'message' => $message
        ]);
    }

    /**
     * Récupérer l'historique complet des messages entre deux utilisateurs
     */
    public function getChatHistory($userId1, $userId2) {
        // Marquer les messages entrants comme lus
        $this->markAsRead($userId2, $userId1);

        $sql = "SELECT id, sender_id, receiver_id, message, is_read, created_at 
                FROM messages 
                WHERE (sender_id = :u1 AND receiver_id = :u2)
                   OR (sender_id = :u2 AND receiver_id = :u1)
                ORDER BY created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['u1' => $userId1, 'u2' => $userId2]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Marquer les messages reçus d'un expéditeur comme lus
     */
    public function markAsRead($receiverId, $senderId) {
        $sql = "UPDATE messages SET is_read = 1 
                WHERE receiver_id = :receiver_id AND sender_id = :sender_id AND is_read = 0";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'receiver_id' => $receiverId,
            'sender_id' => $senderId
        ]);
    }

    /**
     * Obtenir la liste des conversations actives d'un utilisateur
     */
    public function getConversationsList($userId) {
        // Cette requête récupère la liste des utilisateurs avec lesquels $userId a échangé,
        // le dernier message de chaque conversation et le décompte des messages non lus.
        $sql = "
            SELECT 
                u.id AS partner_id,
                u.name AS partner_name,
                u.company_name,
                r.name AS role_name,
                m.message AS last_message,
                m.created_at AS last_message_time,
                (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = :user_id AND is_read = 0) AS unread_count
            FROM users u
            JOIN roles r ON u.role_id = r.id
            JOIN (
                SELECT 
                    IF(sender_id = :user_id, receiver_id, sender_id) AS contact_id,
                    MAX(id) AS max_id
                FROM messages
                WHERE sender_id = :user_id OR receiver_id = :user_id
                GROUP BY contact_id
            ) last_msg ON u.id = last_msg.contact_id
            JOIN messages m ON last_msg.max_id = m.id
            ORDER BY m.created_at DESC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
