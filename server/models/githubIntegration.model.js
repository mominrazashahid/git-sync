const mongoose = require('mongoose');

const githubIntegrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    githubUserId: { type: Number, required: true },
    accessToken: { type: String, required: true },
    tokenType: { type: String },
    scope: { type: String },
    connectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GithubIntegration', githubIntegrationSchema, 'github-integration');
