<?php
require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

use App\Core\Database;

$db = Database::getInstance();

$email = 'admin@btp360.com';
$password = 'admin123';
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$name = 'Admin BTP 360';
$role_id = 1;

try {
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        $stmt = $db->prepare("INSERT INTO users (name, email, password, role_id, is_verified) VALUES (?, ?, ?, ?, 1)");
        $stmt->execute([$name, $email, $hashedPassword, $role_id]);
        echo "Admin user created successfully!\n";
        echo "Email: $email\n";
        echo "Password: $password\n";
    } else {
        $stmt = $db->prepare("UPDATE users SET password = ?, role_id = ?, is_verified = 1 WHERE email = ?");
        $stmt->execute([$hashedPassword, $role_id, $email]);
        echo "Admin user already exists. Password reset to: $password\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
