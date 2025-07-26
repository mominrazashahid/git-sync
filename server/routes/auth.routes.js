const express = require("express");
const passport = require('passport');
const router = express.Router();
const { 
  getOrganizations,
  getRepos,
  getCommits,
  getPulls,
  getIssues,
  getIssueEvents,
  getOrgMembers,
  createUser
} = require("../controllers/auth.controller");

router.get('/', passport.authenticate('github', { scope: ['read:org', 'repo'] }));
router.get(
  '/callback',
  passport.authenticate('github', { failureRedirect: '/' }), createUser
);


module.exports = router;