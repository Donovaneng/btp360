<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use App\Core\JwtHelper;
use PDO;

class NotificationController extends Controller {

    /**
     * GET /notifications/stream
     * Émet un flux SSE contenant les compteurs de notifications en temps réel
     */
    public function stream() {
        // Désactiver la limite de temps d'exécution de PHP pour permettre une connexion persistante
        set_time_limit(0);

        // Récupérer le jeton d'authentification depuis la requête de flux SSE
        $token = $_GET['token'] ?? '';
        
        if (empty($token)) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['error' => 'Authentification requise']);
            exit;
        }

        $userData = JwtHelper::decode($token);
        if (!$userData) {
            header('HTTP/1.1 401 Unauthorized');
            echo json_encode(['error' => 'Jeton invalide ou expiré']);
            exit;
        }

        $userId = (int)$userData['user_id'];
        $roleId = (int)$userData['role_id'];

        // Envoyer les entêtes requis pour le Server-Sent Events (SSE)
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *'); // Gérer le CORS en dev
        header('X-Accel-Buffering: no'); // Évite la mise en cache par Nginx/Apache

        $db = Database::getInstance();

        $lastUnreadMessages = -1;
        $lastPendingDevis = -1;

        // Boucle d'envoi périodique
        while (true) {
            // Interrompre si le navigateur a rompu la connexion
            if (connection_aborted()) {
                break;
            }

            // 1. Nombre de messages non lus pour l'utilisateur
            $stmt = $db->prepare("SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND is_read = 0");
            $stmt->execute([$userId]);
            $unreadMessages = (int)$stmt->fetchColumn();

            // 2. Nombre de demandes de devis au statut 'pending' (Partenaires uniquement)
            $pendingDevis = 0;
            if ($roleId === 3) {
                $stmt = $db->prepare("SELECT COUNT(*) FROM leads WHERE partner_id = ? AND status = 'pending'");
                $stmt->execute([$userId]);
                $pendingDevis = (int)$stmt->fetchColumn();
            }

            // Émettre de nouvelles données si au moins une valeur a changé
            if ($unreadMessages !== $lastUnreadMessages || $pendingDevis !== $lastPendingDevis) {
                $lastUnreadMessages = $unreadMessages;
                $lastPendingDevis = $pendingDevis;

                $payload = [
                    'unread_messages' => $unreadMessages,
                    'pending_devis' => $pendingDevis
                ];

                echo "data: " . json_encode($payload) . "\n\n";
            } else {
                // Heartbeat / ping pour maintenir la connexion active
                echo ": heartbeat\n\n";
            }

            // Vider les buffers PHP
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();

            // Pause de 3 secondes avant la prochaine vérification
            sleep(3);
        }
    }
}
?>
