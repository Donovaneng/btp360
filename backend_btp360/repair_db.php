<?php
/**
 * BTP 360 - Database Repair Script
 */
require_once 'config.php';

$host = DB_HOST;
$user = DB_USER;
$pass = DB_PASS;
$dbname = DB_NAME;

try {
    echo "Connecting to MySQL server...\n";
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Dropping database `$dbname` if exists...\n";
    $pdo->exec("DROP DATABASE IF EXISTS `$dbname` ");
    
    echo "Creating database `$dbname`...\n";
    $pdo->exec("CREATE DATABASE `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname` ");

    echo "Executing database.sql...\n";
    $sql = file_get_contents('database.sql');
    $pdo->exec($sql);

    echo "DATABASE REPAIR SUCCESSFUL!\n";

} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
}
