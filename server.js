const express = require('express');
const cors = require('cors');
const routes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Registrar suas rotas
app.use('/api', routes);

app.listen(3333, () => {
  console.log('Servidor rodando em http://localhost:3333');
});