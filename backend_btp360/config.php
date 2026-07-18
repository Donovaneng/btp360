<?php
/**
 * BTP 360 API - Configuration
 */
define('APP_ENV', 'development'); // 'development' ou 'production'

if (APP_ENV === 'production') {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
} else {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'btp360');
define('DB_USER', 'root');
define('DB_PASS', '');

// URLs de l'application
define('APP_URL', 'http://localhost/btp_360/backend_btp360');
define('UPLOAD_URL', APP_URL . '/uploads/');
define('FRONTEND_URL', 'http://localhost:5173');

// Configuration E-mails
define('EMAIL_DRIVER', 'log'); // 'log' (local file), 'mail' (PHP mail), 'brevo' (API Brevo)
define('BREVO_API_KEY', 'VOTRE_CLE_API_BREVO_ICI'); // Requis uniquement si EMAIL_DRIVER === 'brevo'


try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // En production, ne pas afficher l'erreur exacte
    //die("Erreur de connexion à la base de données.");
    error_log($e->getMessage());
}

// Headers CORS
if (APP_ENV === 'production') {
    header("Access-Control-Allow-Origin: " . FRONTEND_URL);
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

function sendResponse($data, $status = 200) {
    header("Content-Type: application/json");
    http_response_code($status);
    echo json_encode($data);
    exit;
}
