<?php
/**
 * BTP 360 - Front Controller
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';

// Initialisation de l'Autoloader App
App\Core\Autoloader::register();

use App\Core\Router;

// Récupération des infos de la requête
$method = $_SERVER['REQUEST_METHOD'];
$request = $_SERVER['REQUEST_URI'];

// On nettoie le chemin pour le routeur
$base_path = '/btp_360/backend_btp360/index.php';
$route = str_replace($base_path, '', $request);

// Si l'URI est juste le dossier slash final
if ($route === '/btp_360/backend_btp360/') {
    $route = '/';
}

// Initialisation du routeur
$router = new Router();

// Enregistrement des routes
$router->add('GET', '/', 'UserController@index');
$router->add('GET', '/health', 'UserController@health');
$router->add('GET', '/search', 'SearchController@index');

$router->add('GET', '/admin/stats', 'AdminController@dashboardStats');
$router->add('GET', '/admin/clients', 'AdminController@getClients');
$router->add('DELETE', '/admin/clients/(\d+)', 'AdminController@deleteClient');
$router->add('DELETE', '/admin/partners/(\d+)', 'AdminController@deletePartner');
$router->add('GET', '/admin/reviews', 'AdminController@getReviews');
$router->add('DELETE', '/admin/reviews/(\d+)', 'AdminController@deleteReview');
$router->add('PUT', '/admin/reviews/(\d+)/status', 'AdminController@updateReviewStatus');
$router->add('GET', '/notifications/stream', 'NotificationController@stream');

// Auth Routes
$router->add('POST', '/register', 'AuthController@register');
$router->add('POST', '/login', 'AuthController@login');
$router->add('POST', '/auth/google', 'GoogleAuthController@handleGoogle');
$router->add('POST', '/auth/forgot-password', 'PasswordResetController@forgotPassword');
$router->add('POST', '/auth/reset-password', 'PasswordResetController@resetPassword');

// Reviews Routes
$router->add('GET', '/reviews/(\d+)', 'ReviewController@index');
$router->add('POST', '/reviews', 'ReviewController@create');

// Business Routes
// Categories Routes
$router->add('GET', '/categories', 'CategoryController@index');
$router->add('POST', '/categories', 'CategoryController@create');
$router->add('POST', '/categories/(\d+)', 'CategoryController@update');
$router->add('DELETE', '/categories/(\d+)', 'CategoryController@delete');
$router->add('GET', '/partners', 'PartnerController@index');
$router->add('GET', '/partners/(\d+)', 'PartnerController@show');
$router->add('POST', '/partners/(\d+)/verify', 'PartnerController@verify');
$router->add('GET', '/public-stats', 'PartnerController@publicStats');

// Academy Routes
$router->add('GET', '/articles', 'ArticleController@index');
$router->add('POST', '/articles', 'ArticleController@create');
$router->add('GET', '/articles/([^/]+)', 'ArticleController@show');
$router->add('POST', '/articles/(\d+)', 'ArticleController@update');
$router->add('DELETE', '/articles/(\d+)', 'ArticleController@delete');

// Projects Routes
$router->add('GET', '/projects', 'ProjectController@index');
$router->add('POST', '/projects', 'ProjectController@create');
$router->add('GET', '/projects/my', 'ProjectController@myProjects');
$router->add('GET', '/projects/(\d+)', 'ProjectController@show');
$router->add('POST', '/projects/(\d+)', 'ProjectController@update');
$router->add('DELETE', '/projects/(\d+)', 'ProjectController@delete');

// Profile Routes
$router->add('GET', '/profile', 'ProfileController@show');
$router->add('POST', '/profile/update', 'ProfileController@update');
$router->add('POST', '/profile/avatar', 'ProfileController@updateAvatar');
$router->add('POST', '/profile/update-password', 'ProfileController@updatePassword');

// Leads Routes
$router->add('POST', '/leads', 'LeadController@create');
$router->add('PUT', '/leads/(\d+)/status', 'LeadController@updateStatus');

// Upload Routes
$router->add('POST', '/upload-project-image', 'UploadController@uploadProjectImage');
$router->add('POST', '/upload-article-image', 'UploadController@uploadArticleImage');
$router->add('GET', '/leads', 'LeadController@index');
$router->add('GET', '/admin/leads', 'LeadController@adminAll');

// Favorites Routes
$router->add('GET', '/favorites', 'FavoriteController@index');
$router->add('GET', '/favorites/check/(\d+)', 'FavoriteController@check');
$router->add('POST', '/favorites/toggle', 'FavoriteController@toggle');
$router->add('DELETE', '/favorites/(\d+)', 'FavoriteController@remove');

// Devis (Quote Requests) Routes
$router->add('POST', '/devis', 'DevisController@create');
$router->add('GET', '/devis', 'DevisController@index');
$router->add('PUT', '/devis/(\d+)/status', 'DevisController@updateStatus');

// Contact Route
$router->add('POST', '/contact', 'ContactController@send');

// Messages (Chat) Routes
$router->add('POST', '/messages', 'MessageController@send');
$router->add('GET', '/messages/conversation/(\d+)', 'MessageController@getConversation');
$router->add('GET', '/messages/conversations', 'MessageController@getConversations');

// Admin Devis Route
$router->add('GET', '/admin/devis', 'DevisController@adminAll');

// Dispatching
$router->dispatch($method, $route);
