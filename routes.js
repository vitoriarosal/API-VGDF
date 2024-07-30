const express = require('express');
const pool = require('../db');

const router = express.Router();

// Função para listar todos os registros de uma tabela
router.get('/:table', async (req, res) => {
  const { table } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM ${table}`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter dados');
  }
});

// Função para obter um registro específico por ID
router.get('/:table/:id', async (req, res) => {
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

// Função para inserir dados em uma tabela
router.post('/:table', async (req, res) => {
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

// Função para atualizar dados por ID em uma tabela
router.put('/:table/:id', async (req, res) => {
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

// Função para deletar dados por ID em uma tabela
router.delete('/:table/:id', async (req, res) => {
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

module.exports = router;
