import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour retrouver __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir le dossier build
app.use(express.static(path.join(__dirname, 'build')));

// Toutes les routes doivent renvoyer index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server ready at http://localhost:${PORT}`);
});
