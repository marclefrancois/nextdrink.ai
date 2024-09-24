const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Constantes pour l'algorithme de recommandation
const DRINK_TYPES = {
  ALCOHOLIC: 'alcoholic',
  NON_ALCOHOLIC: 'non_alcoholic',
  HALF_HALF: 'half_half'
};

const PARTICIPANT_TYPES = {
  TALKER: 'talker',
  DANCER: 'dancer'
};

const DRUNKENNESS_LEVELS = {
  SOBER: 'sober',
  TIPSY: 'tipsy',
  DRUNK: 'drunk'
};

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes d'authentification
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering new user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = rows[0];
    if (await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token });
    } else {
      res.status(400).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Routes de gestion des boissons
app.get('/api/drinks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM drinks');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching drinks' });
  }
});

app.get('/api/drinks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM drinks WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the drink' });
  }
});

app.post('/api/drinks', authenticateToken, async (req, res) => {
  const { name, type, style, ingredients, alcohol_content, category, drunkenness_level } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO drinks (name, type, style, ingredients, alcohol_content, category, drunkenness_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, type, style, ingredients, alcohol_content, category, drunkenness_level]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while adding a new drink' });
  }
});

app.put('/api/drinks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, type, style, ingredients, alcohol_content, category, drunkenness_level } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE drinks SET name = $1, type = $2, style = $3, ingredients = $4, alcohol_content = $5, category = $6, drunkenness_level = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      [name, type, style, ingredients, alcohol_content, category, drunkenness_level, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the drink' });
  }
});

app.delete('/api/drinks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM drinks WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the drink' });
  }
});

// Routes de gestion de l'historique de consommation
app.post('/api/consumption', authenticateToken, async (req, res) => {
  const { drinkId } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO consumption_history (user_id, drink_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, drinkId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding to consumption history' });
  }
});

app.get('/api/consumption', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT ch.*, d.name FROM consumption_history ch JOIN drinks d ON ch.drink_id = d.id WHERE ch.user_id = $1 ORDER BY ch.consumed_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching consumption history' });
  }
});

// Fonction de recommandation
async function recommendDrinks(userId, userPreferences) {
  const {
    drinkType,
    preferredStyle,
    participantType,
    desiredDrunkennessLevel
  } = userPreferences;

  try {
    // Récupérer l'historique de consommation récent de l'utilisateur
    const { rows: history } = await pool.query(
      'SELECT ch.drink_id, d.type, d.name FROM consumption_history ch JOIN drinks d ON ch.drink_id = d.id WHERE ch.user_id = $1 AND ch.consumed_at > NOW() - INTERVAL \'12 hours\' ORDER BY ch.consumed_at DESC',
      [userId]
    );

    const recentDrinkIds = history.map(h => h.drink_id);
    const recentAlcoholicDrinks = history.filter(h => h.type === DRINK_TYPES.ALCOHOLIC).length;
    const recentWaterDrinks = history.filter(h => h.name.toLowerCase().includes('eau') || h.name.toLowerCase().includes('gatorade')).length;

    // Calculer le ratio d'alcool consommé récemment
    const alcoholRatio = recentAlcoholicDrinks / (history.length || 1);

    const { rows: drinks } = await pool.query('SELECT * FROM drinks');

    let recommendations = drinks.map(drink => {
      let score = 0;

      // Scoring de base
      if (drink.type === drinkType) score += 2;
      if (drink.style === preferredStyle) score += 2;
      if (drink.category === participantType || drink.category === 'both') score += 2;
      if (drink.drunkenness_level === desiredDrunkennessLevel) score += 3;

      // Favoriser fortement l'eau ou le Gatorade après des boissons alcoolisées
      if (alcoholRatio > 0.5 && (drink.name.toLowerCase().includes('eau') || drink.name.toLowerCase().includes('gatorade'))) {
        score += 20;
      }

      // Pénaliser les boissons alcoolisées si l'utilisateur a déjà beaucoup bu
      if (alcoholRatio > 0.5 && drink.type === DRINK_TYPES.ALCOHOLIC) {
        score -= 15;
      }

      // Favoriser les boissons non-alcoolisées après une série de boissons alcoolisées
      if (recentAlcoholicDrinks > 2 && drink.type !== DRINK_TYPES.ALCOHOLIC) {
        score += 10;
      }

      // Pénaliser les boissons récemment consommées
      if (recentDrinkIds.includes(drink.id)) {
        score -= 5;
      }

      // Ajouter un élément aléatoire pour plus de variété
      score += Math.random() * 3;

      return { ...drink, score };
    });

    recommendations.sort((a, b) => b.score - a.score);

    // Assurer un mélange de recommandations avec une préférence pour les boissons non-alcoolisées
    let finalRecommendations = [];
    let alcoholicCount = 0;
    let nonAlcoholicCount = 0;
    const maxAlcoholic = alcoholRatio > 0.5 ? 1 : 2; // Limiter à 1 boisson alcoolisée si l'utilisateur a déjà beaucoup bu

    for (let drink of recommendations) {
      if (finalRecommendations.length >= 5) break;

      if (drink.type === DRINK_TYPES.ALCOHOLIC && alcoholicCount < maxAlcoholic) {
        finalRecommendations.push(drink);
        alcoholicCount++;
      } else if (drink.type !== DRINK_TYPES.ALCOHOLIC && nonAlcoholicCount < (5 - maxAlcoholic)) {
        finalRecommendations.push(drink);
        nonAlcoholicCount++;
      }
    }

    // Compléter avec des boissons non-alcoolisées si nécessaire
    while (finalRecommendations.length < 5) {
      const nonAlcoholicDrink = recommendations.find(d => d.type !== DRINK_TYPES.ALCOHOLIC && !finalRecommendations.includes(d));
      if (nonAlcoholicDrink) {
        finalRecommendations.push(nonAlcoholicDrink);
      } else {
        break; // Sortir de la boucle si aucune boisson non-alcoolisée n'est disponible
      }
    }

    return finalRecommendations;
  } catch (error) {
    console.error('Error in recommendation algorithm:', error);
    return [];
  }
}


// Route de recommandation
app.post('/api/recommend', authenticateToken, async (req, res) => {
  try {
    const userPreferences = req.body;
    const recommendations = await recommendDrinks(req.user.id, userPreferences);
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while generating recommendations' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NextDrink.ai backend running on port ${PORT}`));
