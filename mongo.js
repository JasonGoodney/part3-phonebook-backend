const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as first argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0-r1agp.mongodb.net/phonebook-app?retryWrites=true&w=majority`;
mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

const save = doc => {
  doc.save().then(response => {
    const { name, number } = response;
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
};

const displayAll = () => {
  console.log('Phonebook:');
  Person.find({}).then(response => {
    response.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
};

if (process.argv.length < 5) {
  displayAll();
} else {
  const name = process.argv[3];
  const number = process.argv[4];
  const person = new Person({
    name,
    number
  });

  save(person);
}
