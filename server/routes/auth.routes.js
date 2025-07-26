const express = require("express");
const passport = require('passport');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { 
  createUser,
  getGithubData
} = require("../controllers/auth.controller");

router.get('/', passport.authenticate('github', { scope: ['read:org', 'repo'] }));
router.get(
  '/callback',
  passport.authenticate('github', { failureRedirect: '/' }), createUser
);


router.get("/data", authMiddleware, getGithubData)


module.exports = router;