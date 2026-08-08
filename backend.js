const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir les fichiers statiques (index.html, etc.)
app.use(express.static(path.join(__dirname)));

// Connexion à Supabase via DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
    if (err) {
        console.error('[ERREUR] Connexion Supabase échouée :', err.message);
    } else {
        console.log('[✅] Connecté à Supabase PostgreSQL');
    }
});

// Route de recherche
app.post('/api/search', async (req, res) => {
    try {
        const { query, type } = req.body;
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Requête vide' });
        }
        const q = query.trim();

        // Utiliser les noms de colonnes renommés (sans accents, en minuscules)
        let sql = '';
        let params = [];
        switch (type) {
            case 'email':
                sql = `SELECT * FROM etat_civil WHERE email_principal ILIKE $1 OR email_officiel ILIKE $1`;
                params = [`%${q}%`];
                break;
            case 'phone':
                sql = `SELECT * FROM etat_civil WHERE mobile_personnel ILIKE $1 OR mobile_travail ILIKE $1 OR tel_domicile ILIKE $1 OR tel_travail ILIKE $1`;
                params = [`%${q}%`];
                break;
            default: // username
                sql = `SELECT * FROM etat_civil WHERE nom_1 ILIKE $1 OR prenom_1 ILIKE $1 OR email_principal ILIKE $1`;
                params = [`%${q}%`];
        }

        const result = await pool.query(sql, params);
        res.json({ results: result.rows });

    } catch (error) {
        console.error('[ERREUR SQL]', error.message);
        res.status(500).json({ error: 'Erreur base de données' });
    }
});

// Route statistiques
app.get('/api/stats', async (req, res) => {
    try {
        const total = await pool.query('SELECT COUNT(*) FROM etat_civil');
        res.json({ total: parseInt(total.rows[0].count) });
    } catch (error) {
        res.status(500).json({ error: 'Erreur stats' });
    }
});

// Démarrer le serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`[🚀] Serveur lancé sur le port ${PORT}`);
});
