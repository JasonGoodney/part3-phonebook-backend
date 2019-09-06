const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

morgan.token('post', (req, res) => {
  const body = req.body;
  return JSON.stringify(body);
});

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :post'
  )
);

app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

let persons = [
  {
    'name': 'chips ahoy',
    'number': '898349583',
    'id': 6
  },
  {
    'name': 'oreo',
    'number': '8953892358',
    'id': 7
  },
  {
    'name': 'thin mint',
    'number': '902359802',
    'id': 9
  }
];

app.use(express.static('build'));

app.get('/', (req, res) => {
  res.send('<h1>Phonebook</h1>');
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);

  // Filter out id
  persons = persons.filter(p => p.id !== id);

  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  const body = req.body;
  const { name, number } = body;

  if (!name) {
    res.status(400).json({
      error: 'name is missing'
    });
    return;
  } else if (persons.find(p =>
    p.name.toLowerCase() === name.toLowerCase())
  ) {
    res.status(400).json({
      error: 'name must be unique'
    });
    return;
  } else if (!number) {
    res.status(400).json({
      error: 'number is missing'
    });
    return;
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  };

  persons = persons.concat(person);

  res.json(person);
});

const generateId = () => {
  return parseInt(Math.random() * 1000000000);
};

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})
;
