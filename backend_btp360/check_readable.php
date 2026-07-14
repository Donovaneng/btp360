<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    echo "Count in users: " . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "Error on users: " . $e->getMessage() . "\n";
}

try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM roles");
    echo "Count in roles: " . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "Error on roles: " . $e->getMessage() . "\n";
}
