const express = require('express');
const pool = require('./db'); // Importando a configuração do banco de dados

const app = express();
const port = 3000;

// Analisar o corpo das requisições como JSON
app.use(express.json());

// Rota para testar a conexão com o banco de dados
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

// Listar todos os registros de uma tabela
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

// Obter um registro específico por ID
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

// Inserir dados em uma tabela
app.post('/:table', async (req, res) => {
  const { table } = req.params;
  const columns = Object.keys(req.body);
  const values = Object.values(req.body);
  const placeholders = columns.map((col, idx) => `$${idx + 1}`).join(', ');

  try {
    const result = await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir dados');
  }
});

// Atualizar dados por ID em uma tabela
app.put('/:table/:id', async (req, res) => {
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

// Deletar dados por ID em uma tabela
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



// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
