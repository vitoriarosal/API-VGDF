const express = require('express');
const pool = require('./db'); 
const favicon = require('serve-favicon');
const path = require('path');
const { validationResult } = require('express-validator');
const { validateApa } = require('./validators'); 
const cors = require ('cors')


const app = express();
app.use(cors());

app.use(express.json());

//app.use((req, res, next) => {

//res.header("Access-Control-Allow-Origin", "*")
//});
//res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

//res.header("Acess-Control-Allow-Headers", "Content-Type");

//next();

app.use(cors({
  origin: 'http://localhost:3000', // Porta onde seu frontend está rodando
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

//app.post('/api/submit', validateApa, async (req, res) => {
 // console.log(req.body);
//});


app.post('/api/submit', validateApa, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome_completo, data_de_nascimento, genero, ocupacao, telefone, instagram, email, regiao_onde_mora, orgao, comunidade_onde_mora, origem } = req.body;
  const emailToSave = email === '' ? null : email;

  try {
    // Verificar se o número de telefone já existe no banco de dados
    const checkPhone = await pool.query('SELECT telefone FROM BaseDeDados WHERE telefone = $1', [telefone]);

    // Se o número de telefone já estiver cadastrado, retornar erro
    if (checkPhone.rows.length > 0) {
      return res.status(400).json({ error: 'Já tem um número cadastrado.' });
    }

    // Se o número de telefone não existir, faz a inserção
    const result = await pool.query(
      `INSERT INTO BaseDeDados (nome_completo, data_de_nascimento, genero, ocupacao, telefone, instagram, email, regiao_onde_mora, orgao, comunidade_onde_mora, origem) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [nome_completo, data_de_nascimento, genero, ocupacao, telefone, instagram, emailToSave, regiao_onde_mora, orgao, comunidade_onde_mora, origem]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {  // Código para violação de chave única
      res.status(400).json({ error: 'Número de telefone já cadastrado.' });
    } else {
      console.error(err);
      res.status(500).send('Erro ao inserir dados');
    }
  }
});




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

  console.log(req.body);
  console.log("Email recebido: ", req.body.email);

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



/*/{
	"nome_completo": "JOÃO VICTOR GOMES PEREIRA",
	"data_de_nascimento": "3-jan.",
	"genero": null,
	"ocupacao": null,
	"telefone": "(61) 9931-83823",
	"instagram": null,
	"email": "gggabrielagomes@gmail.com",
	"regiao_onde_mora": "SOBRADINHO",
	"orgao": null,
	"comunidade": null,
	"origem": null,
	"id": 37712
}*/