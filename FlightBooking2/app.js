const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Routes
app.use('/', require('./src/routes/authRoutes'));
app.use('/', require('./src/routes/adminRoutes'));
app.use('/', require('./src/routes/userRoutes'));

module.exports = app;
