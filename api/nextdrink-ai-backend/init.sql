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
('Mojito', 'alcoholic', 'festif', ARRAY['rhum blanc', 'menthe', 'citron vert', 'sucre', 'eau gazeuse'], 5.0, 'both', 'tipsy'),
('Virgin Colada', 'non_alcoholic', 'classique', ARRAY['jus d''ananas', 'lait de coco', 'glace pilée'], 0.0, 'dancer', 'sober'),
('Gin Tonic', 'alcoholic', 'classique', ARRAY['gin', 'tonic', 'citron'], 7.0, 'talker', 'tipsy'),
('Bloody Caesar', 'alcoholic', 'québécois', ARRAY['vodka', 'jus de tomate', 'jus de palourde', 'sauce Worcestershire', 'sauce épicée'], 6.0, 'talker', 'tipsy'),
('Limonade à l''érable', 'non_alcoholic', 'québécois', ARRAY['sirop d''érable', 'jus de citron', 'eau gazeuse'], 0.0, 'both', 'sober'),
('Margarita', 'alcoholic', 'festif', ARRAY['tequila', 'triple sec', 'jus de citron vert'], 8.0, 'dancer', 'drunk'),
('Espresso Martini', 'alcoholic', 'classique', ARRAY['vodka', 'liqueur de café', 'espresso'], 7.5, 'talker', 'tipsy'),
('Spritz à la Canneberge', 'half_half', 'québécois', ARRAY['vin blanc', 'jus de canneberge', 'eau gazeuse'], 4.0, 'both', 'tipsy'),
('Smoothie Énergie Verte', 'non_alcoholic', 'festif', ARRAY['épinards', 'banane', 'pomme', 'gingembre'], 0.0, 'dancer', 'sober'),
('Caribou', 'alcoholic', 'québécois', ARRAY['vin rouge', 'whisky', 'sirop d''érable'], 9.0, 'talker', 'drunk'),
('Eau', 'non_alcoholic', 'classique', ARRAY['eau'], 0.0, 'both', 'sober'),
('Gatorade', 'non_alcoholic', 'sportif', ARRAY['eau', 'électrolytes', 'sucre'], 0.0, 'both', 'sober');
