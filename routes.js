const express = require('express');
const pool = require('../db');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

const router = express.Router();

// Middleware de validação
const validateApa = [
  body('nome_completo')
    .notEmpty()
    .withMessage('O nome completo é obrigatório.'),
  
  body('data_de_nascimento')
    .notEmpty()
    .withMessage('A data de nascimento é obrigatória.')
    .custom((value) => {
      const isDateDDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/.test(value);
      const isDateYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/.test(value);
      
      if (!isDateDDMMYYYY && !isDateYYYYMMDD) {
        throw new Error('Data de nascimento inválida. Use o formato DD/MM/YYYY ou YYYY-MM-DD.');
      }
      
      return true;
    }),
  
  body('regiao_onde_mora')
    .notEmpty()
    .withMessage('A região onde mora é obrigatória.'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido.'),
  
  body('telefone')
    .notEmpty()
    .withMessage('O telefone é obrigatório.')
];

router.post('/:table', validateApa, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

module.exports = router;

