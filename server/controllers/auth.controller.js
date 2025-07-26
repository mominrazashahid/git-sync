const axios = require('axios');
const User = require("../models/user.model");
const GithubIntegration = require("../models/githubIntegration.model");
const {syncUserData} = require("../services/github.sync.service");


exports.createUser = async (req, res) => {
    const profile = req.user;
    const json = profile._json;

    // create/update user
    const user = await User.findOneAndUpdate(
        { githubId: json.id },
        {
            githubId: json.id,
            username: json.login,
            name: json.name,
            avatar: json.avatar_url,
            profileUrl: json.html_url,
            company: json.company,
            blog: json.blog,
            location: json.location
        },
        { upsert: true, new: true }
    );

    // insert github info 
    await GithubIntegration.findOneAndUpdate(
        { userId: user._id },
        {
            userId: user._id,
            githubUserId: json.id,
            accessToken: profile.accessToken,
            connectedAt: new Date()
        },
        { upsert: true, new: true }
    );

    
    syncUserData({  user_id: user._id ,accessToken:profile.accessToken});


    return res.json({ message: 'Authenticated', data: { user,  accessToken: profile.accessToken} });
}
