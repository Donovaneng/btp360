<?php
/**
 * Migration : Table devis
 * Exécuter UNE SEULE FOIS via : http://localhost/btp_360/backend_btp360/migrate_devis.php
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

$pdo = App\Core\Database::getInstance();

$sql = "
    CREATE TABLE IF NOT EXISTS devis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        partner_id INT NULL,
        service VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        budget VARCHAR(100) NULL,
        deadline VARCHAR(100) NULL,
        address VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        status ENUM('pending','accepted','rejected','completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
";

echo '<h2 style="font-family:monospace">Migration Devis</h2><pre>';
try {
    $pdo->exec($sql);
    echo "OK  Table devis créée avec succès.\n";
} catch (\PDOException $e) {
    echo "ERR : " . $e->getMessage() . "\n";
}
echo "\nMigration terminée. Supprimez ce fichier après utilisation.</pre>";
?>
