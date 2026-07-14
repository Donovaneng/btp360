<?php
require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

use App\Core\Database;
use App\Models\UserModel;

header('Content-Type: text/plain');

try {
    echo "Testing Database Connection...\n";
    $db = Database::getInstance();
    echo "Connection Successful!\n\n";

    echo "Testing UserModel::findByEmail...\n";
    $userModel = new UserModel();
    $user = $userModel->findByEmail('admin@btp360.com'); // Check a known email or just any
    if ($user) {
        echo "User found: " . $user['name'] . "\n";
    } else {
        echo "User not found (this is OK if email doesn't exist, as long as no exception occurred).\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
