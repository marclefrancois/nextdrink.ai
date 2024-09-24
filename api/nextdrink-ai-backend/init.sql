-- Initialisation de la base de données pour NextDrink.ai

-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des boissons
CREATE TABLE IF NOT EXISTS drinks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    style VARCHAR(50) NOT NULL,
    ingredients TEXT[] NOT NULL,
    alcohol_content DECIMAL(3,1),
    category VARCHAR(20) NOT NULL,
    drunkenness_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table de l'historique de consommation
CREATE TABLE IF NOT EXISTS consumption_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    drink_id INTEGER REFERENCES drinks(id),
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création des index
CREATE INDEX IF NOT EXISTS idx_drinks_type ON drinks(type);
CREATE INDEX IF NOT EXISTS idx_drinks_style ON drinks(style);
CREATE INDEX IF NOT EXISTS idx_drinks_category ON drinks(category);

-- Insertion des boissons de base
INSERT INTO drinks (name, type, style, ingredients, alcohol_content, category, drunkenness_level) VALUES
('Nuit Polaire', 'alcoholic', 'classique', ARRAY['vodka', 'liqueur de menthe', 'crème de cacao blanche', 'crème'], 20.0, 'both', 'tipsy'),
('Étoile Givrée', 'alcoholic', 'festif', ARRAY['gin', 'jus de pamplemousse', 'sirop de romarin', 'eau gazeuse'], 15.0, 'both', 'tipsy'),
('Réveillon Rubis', 'alcoholic', 'classique', ARRAY['vodka', 'jus de canneberge', 'triple sec', 'jus de lime'], 15.0, 'both', 'tipsy'),
('Cloche de Cannelle', 'alcoholic', 'festif', ARRAY['rhum épicé', 'jus de pomme', 'sirop de cannelle', 'jus de citron'], 15.0, 'both', 'tipsy'),
('Mystère des Fêtes', 'alcoholic', 'classique', ARRAY['bourbon', 'vermouth doux', 'bitter à l\'orange', 'sirop d\'érable'], 20.0, 'both', 'drunk'),
('Père Noël Piquant', 'alcoholic', 'festif', ARRAY['tequila', 'jus de tomate', 'jus de lime', 'sauce piquante'], 15.0, 'both', 'tipsy'),
('Flocon d\'Or', 'alcoholic', 'festif', ARRAY['champagne', 'liqueur de sureau', 'jus de citron', 'sirop de sucre'], 12.0, 'both', 'sober'),
('Café de Minuit', 'alcoholic', 'classique', ARRAY['rhum', 'Kahlúa', 'espresso', 'crème'], 15.0, 'both', 'tipsy'),
('Noël Tropical', 'alcoholic', 'festif', ARRAY['rhum', 'jus d\'ananas', 'jus d\'orange', 'sirop de grenadine'], 15.0, 'both', 'tipsy'),
('Épice de Noël', 'alcoholic', 'classique', ARRAY['whisky', 'sirop de miel', 'jus de citron', 'cannelle'], 20.0, 'both', 'tipsy'),
('Brise Boréale', 'alcoholic', 'festif', ARRAY['gin', 'jus de canneberge blanc', 'jus de citron vert', 'eau tonique'], 15.0, 'both', 'tipsy'),
('Roi des Neiges', 'alcoholic', 'classique', ARRAY['vodka', 'curaçao bleu', 'jus de citron', 'sirop de sucre'], 15.0, 'both', 'tipsy'),
('Vin blanc', 'alcoholic', 'classique', ARRAY['vin blanc'], 12.0, 'both', 'tipsy'),
('Vin rouge', 'alcoholic', 'classique', ARRAY['vin rouge'], 12.0, 'both', 'tipsy'),
('Banana wizz', 'alcoholic', 'festif', ARRAY['banane', 'liqueur de banane', 'jus d\'orange'], 10.0, 'both', 'tipsy'),
('Bonhomme de Neige', 'non_alcoholic', 'festif', ARRAY['jus de noix de coco', 'jus d\'ananas', 'sirop de grenadine', 'eau gazeuse'], 0.0, 'both', 'sober'),
('Brise Hivernale', 'non_alcoholic', 'festif', ARRAY['jus de canneberge blanc', 'jus de raisin blanc', 'jus de citron vert', 'eau pétillante'], 0.0, 'both', 'sober'),
('Gingembre Festif', 'non_alcoholic', 'festif', ARRAY['jus de pomme', 'jus de gingembre', 'miel', 'eau gazeuse'], 0.0, 'both', 'sober'),
('Éclat de Framboise', 'non_alcoholic', 'festif', ARRAY['purée de framboise', 'jus de citron', 'sirop de sucre', 'eau pétillante'], 0.0, 'both', 'sober'),
('Lumière Boréale', 'non_alcoholic', 'festif', ARRAY['jus de pamplemousse', 'jus de citron', 'sirop de lavande', 'eau gazeuse'], 0.0, 'both', 'sober'),
('Étoile Sans Alcool', 'non_alcoholic', 'festif', ARRAY['jus de raisin blanc', 'jus de pomme', 'jus de citron', 'eau gazeuse'], 0.0, 'both', 'sober');
