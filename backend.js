const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir les fichiers statiques depuis le dossier courant
app.use(express.static(path.join(__dirname)));

// Route principale : renvoie index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de test simple
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', message: 'Le serveur fonctionne' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
