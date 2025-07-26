const mongoose = require("mongoose");

const OrgRepoSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  full_name: String,
  private: Boolean,
  html_url: String,
  description: String,
  fork: Boolean,
  created_at: Date,
  updated_at: Date,
  pushed_at: Date,
  language: String,
  forks_count: Number,
  stargazers_count: Number,
  watchers_count: Number,
  open_issues_count: Number,
  org_login: String,
  org_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

module.exports = mongoose.model("OrganizationRepo", OrgRepoSchema);
