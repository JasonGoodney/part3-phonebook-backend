const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

morgan.token('post', (req, res) => {
  const body = req.body
  return JSON.stringify(body)
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :post')
)

app.use(bodyParser.json())

const cors = require('cors')
app.use(cors())

let persons = [
  {
    name: 'chips ahoy',
    number: '898349583',
    id: 6
  },
  {
    name: 'oreo',
    number: '8953892358',
    id: 7
  },
  {
    name: 'thin mint',
    number: '902359802',
    id: 9
  }
]

app.use(express.static('build'))

app.get('/', (req, res) => {
  res.send('<h1>Phonebook</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`
  )
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      res.json(person.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      console.log('Deleted:', result)
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  // if (!number) {
  //   res.status(400).json({
  //     error: 'number is missing'
  //   });
  //   return;
  // }

  const person = new Person({
    name,
    number
  })

  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const generateId = () => {
  return parseInt(Math.random() * 1000000000)
}

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
