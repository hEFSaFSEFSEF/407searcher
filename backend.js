const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir tous les fichiers du dossier courant
app.use(express.static(path.join(__dirname)));

// Route de test
app.get('/api/stats', (req, res) => {
    res.json({ total: 0, message: 'Test OK' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
