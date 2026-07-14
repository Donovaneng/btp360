<?php
/**
 * Migration : Table favorites
 * Exécuter UNE SEULE FOIS via : http://localhost/btp_360/backend_btp360/migrate_favorites.php
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

$pdo = App\Core\Database::getInstance();

$sql = "
    CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        partner_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (user_id, partner_id)
    ) ENGINE=InnoDB;
";

echo '<h2 style="font-family:monospace">Migration Favorites</h2><pre>';
try {
    $pdo->exec($sql);
    echo "OK  Table favorites créée avec succès.\n";
} catch (\PDOException $e) {
    echo "ERR : " . $e->getMessage() . "\n";
}
echo "\nMigration terminée. Supprimez ce fichier après utilisation.</pre>";
?>
