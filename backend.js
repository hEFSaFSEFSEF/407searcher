const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir tous les fichiers du dossier courant
app.use(express.static(path.join(__dirname)));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de test pour vérifier que le serveur tourne
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Le serveur fonctionne !' });
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
