const pool = require('../db');

// Função para obter todos os dados da tabela grossi
const getAllGrossi = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grossi');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter dados');
  }
};

// Função para obter um dado específico por ID
const getGrossiById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM grossi WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Dado não encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter dado');
  }
};

// Função para inserir dados
const createGrossi = async (req, res) => {
  const { coluna1, coluna2 } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO grossi (coluna1, coluna2) VALUES ($1, $2) RETURNING *',
      [coluna1, coluna2]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao inserir dados');
  }
};

// Função para atualizar dados por ID
const updateGrossi = async (req, res) => {
  const { id } = req.params;
  const { coluna1, coluna2 } = req.body;
  try {
    const result = await pool.query(
      'UPDATE grossi SET coluna1 = $1, coluna2 = $2 WHERE id = $3 RETURNING *',
      [coluna1, coluna2, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Dado não encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar dados');
  }
};

// Função para deletar dados por ID
const deleteGrossi = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM grossi WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Dado não encontrado');
    }
    res.send('Dado deletado com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao deletar dados');
  }
};

module.exports = {
  getAllGrossi,
  getGrossiById,
  createGrossi,
  updateGrossi,
  deleteGrossi
};
