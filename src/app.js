const express = require('express');
require('dotenv').config();
const connectMongo = require('./config/mongo');
const productRoutes = require('./routes/product.routes');
const startMigration = require('./services/migrate'); // Importar aquí

const app = express();
app.use(express.json());

connectMongo();

// Rutas de la API
app.use('/api/products', productRoutes);

// Endpoint de Migración
app.post('/migrate', (req, res) => {
    // El archivo debe estar en docs/ y llamarse exactamente asi:
    startMigration('./docs/AM-prueba-desempeno-data.csv'); 
    res.json({ message: "Migración iniciada. Revisa la consola." });
});

app.listen(3000, () => console.log('🚀 Servidor en http://localhost:3000'));
