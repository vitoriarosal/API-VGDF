const { Pool } = require('pg');

// Configuração da conexão
const pool = new Pool({
  user: 'postgres',       // substitua pelo seu usuário do PostgreSQL
  host: 'localhost',         // ou o host onde o PostgreSQL está rodando
  database: 'empresas', // substitua pelo nome do seu banco de dados
  password: 'Gabinete2024',     
  port: 5432,                // a porta padrão do PostgreSQL
});

module.exports = pool;