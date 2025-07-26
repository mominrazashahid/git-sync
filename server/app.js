
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const db = require("./db/mongodb");

dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/github-auth';
db.connectToDb(MONGO_URI);

const logger = require('./middlewares/logger');
app.use(logger);
require('./helpers/github.auth');

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/github', authRoutes);

app.get('/', (req, res) => {
  res.send('Server is running...');
});


module.exports = app;


