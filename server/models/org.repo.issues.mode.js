// models/Issue.js

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    issue_id: { type: Number, required: true, unique: true }, 
    number: Number, 
    title: String,
    body: String,
    state: String,
    locked: Boolean,
    comments: Number,
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    html_url: String,
    author_association: String,

    labels: [{ type: Object }],
    assignees: [{ type: Object }],
    user: { type: Object }, 
    reactions: {
        total_count: Number,
        '+1': Number,
        '-1': Number,
        laugh: Number,
        hooray: Number,
        confused: Number,
        heart: Number,
        rocket: Number,
        eyes: Number
    },

    // Associations
    repo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true },
    org_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});


module.exports = mongoose.model('RepoIssue', issueSchema);
