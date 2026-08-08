const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === SERVEUR STATIQUE POUR LE FRONTEND ===
app.use(express.static(path.join(__dirname)));

// === CONNEXION À LA BASE DE DONNÉES (via variables d'environnement) ===
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'osint_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'votre_mot_de_passe_ici',
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test de connexion
pool.connect((err, client, done) => {
    if (err) {
        console.error('[407searcher] ❌ Erreur de connexion à la base :', err.stack);
    } else {
        console.log('[407searcher] ✅ Connecté à PostgreSQL');
        done();
    }
});

// === ROUTE DE RECHERCHE ===
app.post('/api/search', async (req, res) => {
    try {
        const { query, type } = req.body;
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Requête vide' });
        }
        const q = query.trim();

        let sql = '';
        let params = [];
        switch (type) {
            case 'email':
                sql = `SELECT * FROM etat_civil WHERE email_principal ILIKE $1 OR email_officiel ILIKE $1`;
                params = [`%${q}%`];
                break;
            case 'username':
                sql = `SELECT * FROM etat_civil WHERE nom_1 ILIKE $1 OR prenom_1 ILIKE $1 OR nom_2 ILIKE $1 OR prenom_2 ILIKE $1`;
                params = [`%${q}%`];
                break;
            case 'phone':
                sql = `SELECT * FROM etat_civil WHERE mobile_personnel ILIKE $1 OR mobile_travail ILIKE $1 OR tel_domicile ILIKE $1 OR tel_travail ILIKE $1`;
                params = [`%${q}%`];
                break;
            default:
                sql = `
                    SELECT * FROM etat_civil 
                    WHERE nom_1 ILIKE $1 
                       OR prenom_1 ILIKE $1 
                       OR email_principal ILIKE $1 
                       OR email_officiel ILIKE $1 
                       OR mobile_personnel ILIKE $1 
                       OR tel_domicile ILIKE $1
                `;
                params = [`%${q}%`];
        }

        const result = await pool.query(sql, params);
        res.json({ results: result.rows });

    } catch (error) {
        console.error('[407searcher] Erreur SQL :', error);
        res.status(500).json({ error: 'Erreur interne de la base' });
    }
});

// === ROUTE STATISTIQUES ===
app.get('/api/stats', async (req, res) => {
    try {
        const total = await pool.query('SELECT COUNT(*) FROM etat_civil');
        const uniqueEmails = await pool.query('SELECT COUNT(DISTINCT email_principal) FROM etat_civil');
        res.json({
            total: parseInt(total.rows[0].count),
            uniqueEmails: parseInt(uniqueEmails.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur stats' });
    }
});

// === LANCEMENT ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`[407searcher] 🚀 API en écoute sur http://localhost:${PORT}`);
});