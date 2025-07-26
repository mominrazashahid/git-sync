const Organization = require("../models/org.model");
const OrganizationMember = require("../models/org.members.model");
const OrganizationRepo = require("../models/org.repo.model");
const OrganizationCommit = require("../models/org.commit.model");
const RepoIssue = require('../models/org.repo.issues.mode'); 
const RepoPullRequest = require("../models/org.repo.pulls.model");

const axios = require('axios');

const syncUserData = async (data) => {

    const accessToken = data.accessToken;
    // ------------------ GET ORGS ---------------------------
    let userGitOrgs = await getUserOrganizations(accessToken);
    userGitOrgs = userGitOrgs.map((org) => {
        return {
            ...org,
            user_id: data.user_id
        }
    })
    const bulkOps = userGitOrgs.map((org) => ({
        updateOne: {
            filter: { id: org.id },
            update: { $set: org },
            upsert: true,
        },
    }));

    const buildOrg = await Organization.bulkWrite(bulkOps);

    // ---------------------- FOR LOOP ON USER ORGS ---------------------
    const userCloudOrgs = await Organization.find({ user_id: data.user_id }).select({ _id: 1, login: 1 }).lean();
    for (const org of userCloudOrgs) {
        // get orgs members and insert
        const orgUsers = await getOrgizationsMembers(org.login, accessToken);
        const orgUserOps = orgUsers.map(member => ({
            updateOne: {
                filter: { id: member.id },
                update: { $set: { ...member, org_id: org._id, user_id: data.user_id } },
                upsert: true
            }
        }));
        // get orgs repor and insert
        const orgRepos = await getOrgRepos(org.login, accessToken);
        const orgRepoOps = orgRepos.map(repo => ({
            updateOne: {
                filter: { id: repo.id },
                update: {
                    $set: {
                        ...repo,
                        org_login: org.login,
                        org_id: org._id,
                        user_id: data.user_id,
                    }
                },
                upsert: true,
            },
        }));

        const insertedRepos = await OrganizationRepo.bulkWrite(orgRepoOps);
        const buildOrgMembers = await OrganizationMember.bulkWrite(orgUserOps);



    }

    // get repor issues, pulls and commits 
    const repos = await OrganizationRepo.find({ user_id: data.user_id }).select({ org_login: 1, _id: 1, name: 1, org_id: 1, _id: 1 }).lean();
    for (const repo of repos) {
        const reporData = {
            org: repo.org_login, repo: repo.name, accessToken: accessToken, user_id: data.user_id, repo_id: repo._id, org_id: repo.org_id
        }
        const repoCommits = await getOrgCommits(reporData);
        console.log(repoCommits,'orgCommits');
        const repoIssues = await getRepoIssues(reporData);
        console.log(repoIssues,'repoIssues');
        const repoPullrequest = await getRepoPullRequests(reporData);
        console.log(repoPullrequest,'repoIssues');
    }

    // one operation complete. 
    // not get all repo of 

    // get orgnizational user from github
    // insert orgnization users to db
    // fetch user repor from github
    // instert user repor record to db
    // for loop on user repo from github
    // get repor commit max 2000 
    // insert commits to db 
    // get repo issues from github
    // insert repo issues to db


}









// ==================================== API ==============================\\

const GITHUB_API_URL = "https://api.github.com";
// ------------------------------ GET USER ORGS --------------------------\\
const getUserOrganizations = async (accessToken) => {
    const response = await axios.get(`${GITHUB_API_URL}/user/orgs`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    });

    return response.data;
};

// ------------------------------ GET ORGS MEMBERS --------------------------\\
const getOrgizationsMembers = async (orgName, accessToken) => {
    const response = await axios.get(`${GITHUB_API_URL}/orgs/${orgName}/members`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    });

    return response.data;
};

// ------------------------ GET ORG REPOS -----------------------------\\

const getOrgRepos = async (orgLogin, accessToken) => {
    const perPage = 100;
    let page = 1;
    let repos = [];

    while (true) {
        const { data } = await axios.get(
            `${GITHUB_API_URL}/orgs/${orgLogin}/repos`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github+json',
                },
                params: {
                    per_page: perPage,
                    page,
                },
            }
        );

        repos.push(...data);
        if (data.length < perPage) break; // Last page
        page++;
    }

    return repos;
}

// ---------------------- GET REPOR COMMITS --------------------

async function getOrgCommits(data) {
    let allCommits = [];
    let page = 1;
    const perPage = 100;

    while (allCommits.length < 3000) {
        const url = `${GITHUB_API_URL}/repos/${data.org}/${data.repo}/commits?per_page=${perPage}&page=${page}`;

        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${data.accessToken}` }
            });

            const commits = res.data;
            if (!commits.length) break;

            const commitDocs = commits.map(c => ({
                updateOne: {
                    filter: { sha: c.sha },
                    update: {
                        $set: {
                            sha: c.sha,
                            message: c.commit.message,
                            author: c.commit.author,
                            committer: c.commit.committer,
                            repo_name: data.repo,
                            org_login: data.org,
                            user_id: data.user_id,
                            repo_id: data.repo_id,
                            org_id: data.org_id
                        }
                    },
                    upsert: true
                }
            }));

            await OrganizationCommit.bulkWrite(commitDocs);

            allCommits = allCommits.concat(commits);
            if (commits.length < perPage) break;

            page++;
        } catch (err) {
            // Handle empty repo or other API errors
            if (err.response && err.response.status === 409) {
                console.log(`Repo is empty: ${data.org}/${data.repo}`);
                break;
            } else {
                console.error(`Error fetching commits for ${data.org}/${data.repo}:`, err.message);
                break;
            }
        }
    }

    console.log(`${allCommits.length} commits inserted for ${data.org}/${data.repo}`);
}

// ------------------- FETCH PULL REQUEST -----------------
async function getRepoPullRequests(data) {
  const { org, repo, accessToken, org_id, repo_id, user_id } = data;

  let allPRs = [];
  let page = 1;
  const perPage = 100;

  while (allPRs.length < 2000) {
    try {
      const url = `${GITHUB_API_URL}/repos/${org}/${repo}/pulls?state=all&per_page=${perPage}&page=${page}`;
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json'
        }
      });

      const prs = res.data;
      if (!prs.length) break;

      const bulkOps = prs.map(pr => ({
        updateOne: {
          filter: { id: pr.id },
          update: {
            $set: {
              id: pr.id,
              number: pr.number,
              title: pr.title,
              state: pr.state,
              merged: pr.merged_at != null,
              user: {
                login: pr.user?.login,
                id: pr.user?.id
              },
              body: pr.body,
              created_at: pr.created_at,
              updated_at: pr.updated_at,
              closed_at: pr.closed_at,
              merged_at: pr.merged_at,

              repo_name: repo,
              org_login: org,
              repo_id,
              org_id,
              user_id
            }
          },
          upsert: true
        }
      }));

      await RepoPullRequest.bulkWrite(bulkOps);
      allPRs = allPRs.concat(prs);
      if (prs.length < perPage) break;

      page++;
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log(`Empty repo (no PRs): ${org}/${repo}`);
        break;
      } else {
        console.error(`Error fetching PRs for ${org}/${repo}:`, err.message);
        break;
      }
    }
  }

  console.log(`${allPRs.length} pull requests inserted for ${org}/${repo}`);
}

// ----------------- FETCH ISSUES ---------------------


async function getRepoIssues({ org, repo, accessToken, repo_id, org_id, user_id }) {
  let page = 1;
  const perPage = 100;
  let totalInserted = 0;

  try {
    while (true) {
      const res = await axios.get(`${GITHUB_API_URL}/repos/${org}/${repo}/issues`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
        params: {
          per_page: perPage,
          page: page,
        },
      });

      // Filter out pull requests
      const issues = res.data.filter(issue => !issue.pull_request);

      if (!issues.length) break;

      const bulkOps = issues.map(issue => ({
        updateOne: {
          filter: { issue_id: issue.id },
          update: {
            $set: {
              issue_id: issue.id,
              number: issue.number,
              title: issue.title,
              body: issue.body,
              state: issue.state,
              locked: issue.locked,
              comments: issue.comments,
              created_at: issue.created_at,
              updated_at: issue.updated_at,
              closed_at: issue.closed_at || null,
              html_url: issue.html_url,
              author_association: issue.author_association,

              labels: issue.labels || [],
              assignees: issue.assignees || [],
              user: issue.user || {},
              reactions: issue.reactions || {},

              repo_id,
              org_id,
              user_id,
            },
          },
          upsert: true,
        },
      }));

      await RepoIssue.bulkWrite(bulkOps);
      totalInserted += issues.length;

      if (issues.length < perPage || totalInserted >= 2000) break;
      page++;
    }

    console.log(`${totalInserted} issues saved for ${org}/${repo}`);
  } catch (err) {
    console.error(`❌ Error saving issues for ${org}/${repo}:`, err.response?.data || err.message);
  }
}


module.exports = {
    syncUserData
}