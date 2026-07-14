<?php
require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

use App\Controllers\AuthController;

$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock the input for getRequestData
// We'll use a temporary file to override php://input if possible, 
// but since we can't easily, let's just create a child class to test.

class DebugAuthController extends AuthController {
    public function getRequestData() {
        return ['email' => 'admin@btp360.com', 'password' => 'wrong'];
    }
}

$auth = new DebugAuthController();
echo "Executing Debug Login...\n";
try {
    $result = $auth->login();
    echo "Result: " . json_encode($result) . "\n";
} catch (Throwable $e) {
    echo "CRASH: " . $e->getMessage() . "\n";
    echo $e->getFile() . " on line " . $e->getLine() . "\n";
}
