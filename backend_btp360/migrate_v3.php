<?php
/**
 * Migration v3 : Modération des avis
 * Exécuter UNE SEULE FOIS via : php migrate_v3.php ou http://localhost/btp_360/backend_btp360/migrate_v3.php
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

$pdo = App\Core\Database::getInstance();

echo "Migration BTP 360 v3 (Modération des avis)\n";

try {
    // 1. Ajouter la colonne status si elle n'existe pas
    $q = $pdo->query("SHOW COLUMNS FROM reviews LIKE 'status'");
    $col = $q->fetch();
    
    if (!$col) {
        $pdo->exec("ALTER TABLE reviews ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
        echo "OK - Colonne 'status' ajoutée à la table 'reviews'.\n";
        
        // 2. Mettre tous les avis existants à 'approved'
        $pdo->exec("UPDATE reviews SET status = 'approved'");
        echo "OK - Avis existants approuvés par défaut.\n";
    } else {
        echo "INFO - La colonne 'status' existe déjà.\n";
    }
} catch (\PDOException $e) {
    echo "ERR : " . $e->getMessage() . "\n";
}

echo "Migration terminée.\n";
?>
