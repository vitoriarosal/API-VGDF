const { body } = require('express-validator');

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

  // Modificação aqui:
  // .optional() verifica se o campo existe, mas vamos adicionar .isString() para aceitar email nulo ou vazio
  body('email')
    .optional({ checkFalsy: true })  // checkFalsy garante que strings vazias ou valores falsy como null sejam ignorados
    .isEmail()
    .withMessage('Email inválido.'),  // Valida o formato de email apenas se for fornecido
  
  body('telefone')
    .notEmpty()
    .withMessage('O telefone é obrigatório.')
];

module.exports = {
  validateApa
};
