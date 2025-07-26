const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    githubId: { type: Number, required: true, unique: true },
    username: String,
    name: String,
    avatar: String,
    profileUrl: String,
    company: String,
    blog: String,
    location: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
