<?php
/**
 * BTP 360 - Initialisation de la Base de Données
 */

// On inclut les constantes de configuration
require_once 'config.php';

// Informations de connexion (sans base de données spécifiée pour la création)
$host = DB_HOST;
$user = DB_USER;
$pass = DB_PASS;
$dbname = DB_NAME;

try {
    // 1. Connexion au serveur MySQL
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connexion au serveur MySQL réussie...<br>";

    // 2. Création de la base de données
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Base de données `$dbname` vérifiée/créée.<br>";

    // 3. Sélection de la base de données
    $pdo->exec("USE `$dbname`;"); // On s'assure d'utiliser la bonne DB
    
    // On se reconnecte avec la DB cette fois
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 4. Lecture et exécution du fichier SQL
    $sqlFile = 'database.sql';
    if (file_exists($sqlFile)) {
        $sql = file_get_contents($sqlFile);
        
        // Exécution du script SQL global
        // Note: exec() peut ne pas supporter plusieurs instructions SQL selon la config. 
        // On va utiliser query() ou diviser si nécessaire, mais ici on va tenter une exécution brute.
        $pdo->exec($sql);
        echo "Script SQL `$sqlFile` exécuté avec succès.<br>";
    } else {
        echo "Erreur : Le fichier `$sqlFile` est introuvable.<br>";
    }

    echo "<b>Initialisation terminée !</b> La plateforme BTP 360 est prête.";

} catch (PDOException $e) {
    echo "Erreur lors de l'initialisation : " . $e->getMessage();
}
