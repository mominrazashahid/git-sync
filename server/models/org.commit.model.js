const mongoose = require('mongoose');

const OrgCommitSchema = new mongoose.Schema({
    sha: { type: String, required: true, unique: true },
    message: String,
    author: {
        name: String,
        email: String,
        date: Date,
    },
    committer: {
        name: String,
        email: String,
        date: Date,
    },
    url: String,
    repo_name: String,
    org_login: String,
    org_id: mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId,
    repo_id: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

module.exports = mongoose.model('OrganizationCommit', OrgCommitSchema);
