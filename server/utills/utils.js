const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function createGitHubJWT(payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  return token;
}

function verifyGitHubJWT(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { createGitHubJWT, verifyGitHubJWT };