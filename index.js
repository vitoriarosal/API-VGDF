const express = require('express');
const pool = require('./db'); 
const favicon = require('serve-favicon');
const path = require('path');
const { validationResult } = require('express-validator');
const { validateApa } = require('./validators'); 




const app = express();
app.use(express.json());

// Middleware para servir o favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const port = 3333;

// Analisa o corpo das requisições como JSON
app.use(express.json());

// Rota para testar a conexão com o banco 
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

// Lista todos os registros de uma tabela
app.get('/:table', async (req, res) => {
  const { table } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM ${table}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter dados');
  }
});

// Obtem um registro específico por ID
app.get('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Registro não encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter dado');
  }
});

// Inserir dados em uma tabela com validação
app.post('/:table', validateApa, async (req, res) => {
  // Verifica os erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { table } = req.params;
  const columns = Object.keys(req.body);
  const values = Object.values(req.body);
  const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');

  try {
    const result = await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Código de erro para violação de chave única
      res.status(400).send('Email já existe.');
    } else {
      console.error(err);
      res.status(500).send('Erro ao inserir dados');
    }
  }
});

// Atualiza dados por ID em uma tabela
app.put('/:table/:id', validateApa, async (req, res) => {
  // Verifica os erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { table, id } = req.params;
  const columns = Object.keys(req.body);
  const values = Object.values(req.body);
  const setString = columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ');

  try {
    const result = await pool.query(
      `UPDATE ${table} SET ${setString} WHERE id = $${columns.length + 1} RETURNING *`,
      [...values, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Registro não encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar dados');
  }
});

// Deleta dados por ID em uma tabela
app.delete('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Registro não encontrado');
    }
    res.send('Registro deletado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar dados');
  }
});

// Busca registros por nome
app.get('/:table/nome_completo/:nome', async (req, res) => {
  const { table, nome } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE nome_completo ILIKE $1`, [`%${nome}%`]);
    if (result.rows.length === 0) {
      return res.status(404).send('Nenhum registro encontrado com esse nome');
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao procurar pelo nome');
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
