const mongoose = require('mongoose');

const PullRequestSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // GitHub PR ID
  number: Number,
  title: String,
  state: String,
  merged: Boolean,
  user: {
    login: String,
    id: Number,
  },
  body: String,
  created_at: Date,
  updated_at: Date,
  closed_at: Date,
  merged_at: Date,

  repo_name: String,
  org_login: String,
  repo_id: mongoose.Schema.Types.Mixed,
  org_id: mongoose.Schema.Types.Mixed,
  user_id: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('RepoPullRequest', PullRequestSchema);
