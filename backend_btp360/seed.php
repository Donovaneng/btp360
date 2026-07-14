<?php
/**
 * BTP 360 - Seeding Script
 * Populates the database with sample data for demonstration.
 */

require_once 'config.php';
require_once 'src/Core/Autoloader.php';
App\Core\Autoloader::register();

use App\Core\Database;

$db = Database::getInstance();

try {
    echo "Starting seeding...<br>";

    // 1. Add some sample partners
    $partners = [
        [
            'name' => 'Jean-Paul Kamga',
            'email' => 'jp.kamga@btp360.com',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'role_id' => 3, // Partner
            'company_name' => 'Kamga Architecture & Co',
            'city' => 'Douala',
            'phone' => '+237 600 000 001',
            'category_id' => 1 // Architecture
        ],
        [
            'name' => 'Félix Etoa',
            'email' => 'f.etoa@btp360.com',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'role_id' => 3,
            'company_name' => 'Etoa Génie Civil',
            'city' => 'Yaoundé',
            'phone' => '+237 600 000 002',
            'category_id' => 2 // Génie Civil
        ],
        [
            'name' => 'Marie Songo',
            'email' => 'm.songo@btp360.com',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'role_id' => 3,
            'company_name' => 'Songo Décor & Peinture',
            'city' => 'Douala',
            'phone' => '+237 600 000 003',
            'category_id' => 6 // Peinture
        ],
        [
            'name' => 'André Mbarga',
            'email' => 'a.mbarga@btp360.com',
            'password' => password_hash('password123', PASSWORD_BCRYPT),
            'role_id' => 3,
            'company_name' => 'Mbarga Plomberie Moderne',
            'city' => 'Yaoundé',
            'phone' => '+237 600 000 004',
            'category_id' => 5 // Plomberie
        ]
    ];

    foreach ($partners as $p) {
        // Check if exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$p['email']]);
        if (!$stmt->fetch()) {
            $sql = "INSERT INTO users (name, email, password, role_id, company_name, city, phone) 
                    VALUES (:name, :email, :password, :role_id, :company_name, :city, :phone)";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                'name' => $p['name'],
                'email' => $p['email'],
                'password' => $p['password'],
                'role_id' => $p['role_id'],
                'company_name' => $p['company_name'],
                'city' => $p['city'],
                'phone' => $p['phone']
            ]);
            $userId = $db->lastInsertId();

            // Link to category
            $sql = "INSERT INTO user_categories (user_id, category_id) VALUES (?, ?)";
            $db->prepare($sql)->execute([$userId, $p['category_id']]);
            
            echo "Partner added: {$p['name']}<br>";
        } else {
            echo "Partner skipped (exists): {$p['name']}<br>";
        }
    }

    // 2. Add some sample projects
    $projects = [
        [
            'user_email' => 'jp.kamga@btp360.com',
            'title' => 'Villa Moderne à Bonamoussadi',
            'description' => 'Conception architecturale d une villa contemporaine de 5 chambres avec piscine.',
            'completion_date' => '2025-12-20'
        ],
        [
            'user_email' => 'f.etoa@btp360.com',
            'title' => 'Pont de desserte rurale',
            'description' => 'Étude et réalisation d un pont en béton armé de 12 mètres.',
            'completion_date' => '2026-01-15'
        ]
    ];

    foreach ($projects as $pr) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$pr['user_email']]);
        $user = $stmt->fetch();
        
        if ($user) {
            $sql = "INSERT INTO projects (user_id, title, description, completion_date) 
                    VALUES (:user_id, :title, :description, :completion_date)";
            $db->prepare($sql)->execute([
                'user_id' => $user['id'],
                'title' => $pr['title'],
                'description' => $pr['description'],
                'completion_date' => $pr['completion_date']
            ]);
            echo "Project added: {$pr['title']}<br>";
        }
    }

    echo "<b>Seeding completed!</b>";

} catch (Exception $e) {
    echo "Seeding error: " . $e->getMessage();
}
