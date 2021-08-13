const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// const Sauce = require('./models/sauce');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://newuser4:mongodb4user@cluster0.f2e9r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
mongoose.set('useCreateIndex', true);

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
})

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

// app.post('/api/sauces', (req, res, next) => {
//   delete req.body._id;
//   const sauce = new Sauce({
//     ...req.body
//   });
//   sauce.save()
//     .then(() => res.status(201).json(sauce))
//     .catch(error => res.status(400).json({ error }));
// });

// // app.get('/api/sauces', (req, res, next) => {
// //   Sauce.findOne({ _id: req.params.id })
// //     .then(sauce => res.status(200).json(sauce))
// //     .catch(error => res.status(400).json({ error }));
// // })

// app.use('/api/sauces', (req, res, next) => {
//   Sauce.find()
//     .then(sauces => res.status(200).json(sauces))
//     .catch(error => res.status(400).json({ error }));
// });

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;