<?php

namespace App\Core;

/**
 * Autoloader PSR-4 simplifié
 */
class Autoloader {
    public static function register() {
        spl_autoload_register([__CLASS__, 'autoload']);
    }

    public static function autoload($class) {
        // Namespace racine du projet
        $prefix = 'App\\';
        $base_dir = __DIR__ . '/../';

        // Vérifie si la classe utilise ce préfixe
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }

        // Récupère le nom relatif de la classe
        $relative_class = substr($class, $len);

        // Remplace les backslashes par des slashs système et ajoute le suffixe .php
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

        // Si le fichier existe, on le charge
        if (file_exists($file)) {
            require $file;
        }
    }
}
