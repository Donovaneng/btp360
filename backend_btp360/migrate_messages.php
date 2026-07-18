<?php
/**
 * Migration : Table messages (Chat en temps réel)
 * Exécuter via PHP en ligne de commande ou HTTP : http://localhost/btp_360/backend_btp360/migrate_messages.php
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

$pdo = App\Core\Database::getInstance();

$sql = "
    CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
";

echo '<h2 style="font-family:monospace">Migration Messages (Chat)</h2><pre>';
try {
    $pdo->exec($sql);
    echo "OK  Table messages créée avec succès.\n";
} catch (\PDOException $e) {
    echo "ERR : " . $e->getMessage() . "\n";
}
echo "\nMigration terminée. Supprimez ce fichier après utilisation.</pre>";
?>
