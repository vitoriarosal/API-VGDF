// validators.js
const { body } = require('express-validator');

const validateApa = [
  body('nome_completo').notEmpty().withMessage('O nome completo é obrigatório.'),
  body('data_de_nascimento').notEmpty().withMessage('A data de nascimento é obrigatória.')
    .isDate({ format: 'DD/MM/YYYY' }).withMessage('Data de nascimento inválida. Use o formato DD/MM/YYYY.'),
  body('regiao_onde_mora').notEmpty().withMessage('A região onde mora é obrigatória.'),
  body('email').isEmail().withMessage('Email inválido.')
];

module.exports = {
  validateApa
};


//GilbertoPEREIRA, 