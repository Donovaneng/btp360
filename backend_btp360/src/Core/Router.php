<?php

namespace App\Core;

/**
 * Routeur simple pour dispatcher les requêtes
 */
class Router {
    private $routes = [];

    /**
     * Enregistre une route
     */
    public function add($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    /**
     * Dispatche la requête vers le contrôleur
     */
    public function dispatch($method, $uri) {
        $uri = explode('?', $uri)[0];
        
        foreach ($this->routes as $route) {
            $pattern = "#^" . $route['path'] . "$#";
            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // Supprimer l'URL complète
                return $this->executeHandler($route['handler'], $matches);
            }
        }

        $this->notFound();
    }

    private function executeHandler($handler, $params = []) {
        list($controllerName, $method) = explode('@', $handler);
        $fullControllerName = "App\\Controllers\\" . $controllerName;

        if (class_exists($fullControllerName)) {
            $controller = new $fullControllerName();
            if (method_exists($controller, $method)) {
                return call_user_func_array([$controller, $method], $params);
            }
        }

        $this->notFound();
    }

    private function notFound() {
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
        exit;
    }
}
