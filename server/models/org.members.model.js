const mongoose = require('mongoose');

const OrganizationMemberSchema = new mongoose.Schema({
  login: { type: String, required: true },
  id: { type: Number, unique: true },
  github_id: { type: Number, required: true }, // renamed 'id' to avoid conflicts
  node_id: { type: String },
  avatar_url: { type: String },
  gravatar_id: { type: String },
  url: { type: String },
  html_url: { type: String },
  followers_url: { type: String },
  following_url: { type: String },
  gists_url: { type: String },
  starred_url: { type: String },
  subscriptions_url: { type: String },
  organizations_url: { type: String },
  repos_url: { type: String },
  events_url: { type: String },
  received_events_url: { type: String },
  type: { type: String },
  user_view_type: { type: String },
  site_admin: { type: Boolean },
  org_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
  fetched_at: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('OrganizationMember', OrganizationMemberSchema);
