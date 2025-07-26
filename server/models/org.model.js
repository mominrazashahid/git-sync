const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  login: { type: String,  },
  id: { type: Number, unique: true },
  node_id: { type: String },
  url: { type: String },
  repos_url: { type: String },
  events_url: { type: String },
  hooks_url: { type: String },
  issues_url: { type: String },
  members_url: { type: String },
  public_members_url: { type: String },
  avatar_url: { type: String },
  description: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
