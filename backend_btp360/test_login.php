<?php
require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

use App\Controllers\AuthController;

$_SERVER['REQUEST_METHOD'] = 'POST';

$auth = new AuthController();
echo "Executing Login...\n";
try {
    $auth->login();
} catch (Exception $e) {
    echo "CAUGHT ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
