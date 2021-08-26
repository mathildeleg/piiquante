const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv/config');

// routes for the sauces
const sauceRoutes = require('./routes/sauce');
// routes for user
const userRoutes = require('./routes/user');

// connect to mongoDB
mongoose.connect(process.env.DB_CONNECTION,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
mongoose.set('useCreateIndex', true);

const app = express();

// secure express app with http headers
app.use(helmet());

// security so that we can access the API correctly and send requests with the CRUD method
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
})

// needed to handle POST request from front-end, in order to extract JSON object from the request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// replace prohibited characters in keys with "_"
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;