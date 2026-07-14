<?php
/**
 * Migration : Tables et colonnes v2 + logique d'exclusivité
 * Exécuter UNE SEULE FOIS via : http://localhost/btp_360/backend_btp360/migrate_v2.php
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

$pdo = App\Core\Database::getInstance();

$migrations = [
    "Table password_resets" => "
        CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL,
            token VARCHAR(100) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_token (token),
            INDEX idx_email (email)
        ) ENGINE=InnoDB
    ",
    "Table reviews" => "
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            partner_id INT NOT NULL,
            rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_review (client_id, partner_id)
        ) ENGINE=InnoDB
    ",
    "Colonne bio dans users" => "
        ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NULL AFTER city
    ",
    "Colonne google_id dans users" => "
        ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL AFTER password
    ",
    "Table partner_exclusivities" => "
        CREATE TABLE IF NOT EXISTS partner_exclusivities (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            category_id INT NOT NULL,
            city VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
            UNIQUE KEY unique_exclusivity (category_id, city)
        ) ENGINE=InnoDB
    ",
];

echo "<h2 style='font-family:monospace'>Migration BTP 360 v2</h2><pre>";

foreach ($migrations as $label => $sql) {
    try {
        $pdo->exec($sql);
        echo "OK  $label\n";
    } catch (\PDOException $e) {
        echo "ERR $label : " . $e->getMessage() . "\n";
    }
}

echo "\nMigration terminee. Supprimez ce fichier apres utilisation.</pre>";
?>
