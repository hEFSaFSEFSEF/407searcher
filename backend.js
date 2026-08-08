const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('.'));

app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
