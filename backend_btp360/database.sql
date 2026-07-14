-- Script SQL pour la base de données BTP 360
-- Créé le 14/04/2026

CREATE DATABASE IF NOT EXISTS btp360 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE btp360;

-- Désactivation des contraintes pour le nettoyage
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS user_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Table des Rôles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 2. Table des Abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    level ENUM('standard', 'premium', 'exclusif') DEFAULT 'standard',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Table des Utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    subscription_id INT DEFAULT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(30),
    city VARCHAR(100),
    address TEXT,
    company_name VARCHAR(150),
    bio TEXT,
    avatar_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Table des Catégories (Métiers)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Table de Liaison Utilisateurs-Catégories (Spécialités)
CREATE TABLE IF NOT EXISTS user_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, category_id)
) ENGINE=InnoDB;

-- 6. Table des Projets (Portfolio)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Table des Leads (Contacts/Mise en relation)
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    partner_id INT NOT NULL,
    service_requested VARCHAR(150),
    message TEXT,
    status ENUM('pending', 'contacted', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insertion des Rôles de base
INSERT IGNORE INTO roles (id, name, label) VALUES 
(1, 'admin', 'Administrateur'),
(2, 'client', 'Particulier / Client'),
(3, 'partner', 'Partenaire Professionnel'),
(4, 'artisan', 'Artisan / Fournisseur');

-- Insertion des types d'Abonnement
INSERT IGNORE INTO subscriptions (name, price, level, description) VALUES 
('Gratuit', 0.00, 'standard', 'Visibilité basique sur le réseau'),
('Premium', 15000.00, 'premium', 'Mise en avant et support dédié'),
('Exclusif', 45000.00, 'exclusif', 'Exclusivité sur zone ou métier');

-- Insertion des Catégories par défaut
INSERT IGNORE INTO categories (name, slug, icon_name) VALUES 
('Architecture', 'architecture', 'Building'),
('Génie Civil', 'genie-civil', 'Construction'),
('Maçonnerie', 'maconnerie', 'Brick'),
('Électricité', 'electricite', 'Zap'),
('Plomberie', 'plomberie', 'Droplets'),
('Peinture', 'peinture', 'Palette'),
('Aménagement Extérieur', 'jardinage', 'Trees');

-- 8. Table de l'Académie (Articles)
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT,
    image_url VARCHAR(255),
    author_id INT,
    category_id INT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Insertion d'articles de test pour l'Académie
INSERT IGNORE INTO articles (title, slug, excerpt, content, category_id) VALUES 
('Comment choisir son architecte au Cameroun ?', 'choisir-architecte-cameroun', 'Guide pratique pour dénicher le perle rare pour votre projet de construction.', 'Le contenu complet de l article ici...', 1),
('Les nouvelles normes de construction en 2026', 'normes-construction-2026', 'Tout savoir sur les réglementations thermiques et structurelles au Cameroun.', 'Le contenu complet de l article ici...', 2),
('Optimiser son budget de peinture', 'optimiser-budget-peinture', 'Astuces pour réduire les coûts sans sacrifier la qualité de finition.', 'Le contenu complet de l article ici...', 6);
