const mongoose = require('mongoose');
const User = require("../models/user.model");
const GithubIntegration = require("../models/githubIntegration.model");
const { syncUserData } = require("../services/github.sync.service");
const { createGitHubJWT } = require("../utills/utils");
const Organization = require("../models/org.model");
const cloudUser = require("../models/user.model");
const OrganizationRepo = require("../models/org.repo.model");
const OrganizationCommit = require("../models/org.commit.model");
const RepoIssue = require('../models/org.repo.issues.mode');
const RepoPullRequest = require("../models/org.repo.pulls.model");

const COLLECTION_MAP = {
    orgs: Organization,
    repos: OrganizationRepo,
    pulls: RepoPullRequest,
    commits: OrganizationCommit,
    issues: RepoIssue
};


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


    syncUserData({ user_id: user._id, accessToken: profile.accessToken });
    const payload = {
        accessToken: profile.accessToken,
        username: user.username,
        name: user.name
    }

    const token = createGitHubJWT(payload);
    return res.json({ message: 'Authenticated', data: { user, accessToken: token } });
}


exports.getGithubData = async (req, res) => {
    const { collection, page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let useSearch = false;
    if (!collection) {
        useSearch = true;
    }

    const user = await cloudUser.findOne({username: req.user.username});
    if(!user){
        return res.status(400).json({error: 'Something went wrong'});
    }

    try {
        // Case 1: Collection provided
        if (collection && COLLECTION_MAP[collection]) {
            const Model = COLLECTION_MAP[collection];
            const query = useSearch ? globalSearchQuery(search, collection) : {user_id: new mongoose.Types.ObjectId(user._id)};
            console.log(query,'query');
            const data = await Model.find(query).skip(skip).limit(parseInt(limit));
            const total = await Model.countDocuments(query);

            return res.json({
                [collection]: data,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            });
        }

        // Case 2: No collection but search term exists (global search across all)
        if (!collection && useSearch) {
            const results = {};
            let total = 0;

            for (const [colName, Model] of Object.entries(COLLECTION_MAP)) {
                const docs = await Model.find(globalSearchQuery(search, colName)).limit(limit);
                results[colName] = docs;
                total += docs.length;
            }

            return res.json({
                search,
                total,
                results,
            });
        }

        // Case 3: No collection and no search — invalid
        return res.status(400).json({
            error: 'Collection is required unless search term is provided.',
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch data.' });
    }
}



const globalSearchQuery = (search, collection) => {
    const searchQueries = {
        orgs: {
            $or: [
                { login: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        },
        repos: {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { full_name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { language: { $regex: search, $options: 'i' } },
                { org_login: { $regex: search, $options: 'i' } }
            ]
        },
        commits: {
            $or: [
                { message: { $regex: search, $options: 'i' } },
                { sha: { $regex: search, $options: 'i' } },
                { 'author.name': { $regex: search, $options: 'i' } },
                { 'author.email': { $regex: search, $options: 'i' } },
                { 'committer.name': { $regex: search, $options: 'i' } },
                { 'committer.email': { $regex: search, $options: 'i' } },
                { repo_name: { $regex: search, $options: 'i' } },
                { org_login: { $regex: search, $options: 'i' } }
            ]
        },
        issues: {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { author_association: { $regex: search, $options: 'i' } },
                { 'user.login': { $regex: search, $options: 'i' } },
                { number: parseInt(search) || 0 }
            ]
        },
        pulls: {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { 'user.login': { $regex: search, $options: 'i' } },
                { repo_name: { $regex: search, $options: 'i' } },
                { org_login: { $regex: search, $options: 'i' } },
                { number: parseInt(search) || 0 }
            ]
        }
    };

    return collection ? searchQueries[collection] || {} : searchQueries;
};