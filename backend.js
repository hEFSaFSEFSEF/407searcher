const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route de test
app.get('/api/status', (req, res) => {
    res.json({ status: 'OK' });
});

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
