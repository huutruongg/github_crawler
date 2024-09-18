const axios = require('axios');

// Function to fetch repositories for a specific user
async function fetchUserRepositories(username, token) {
    try {
        const url = `https://api.github.com/users/${username}/repos`;
        const headers = {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'  // Ensure proper media type
        };

        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error fetching repositories for ${username}:`, error.message);
        return [];
    }
}

// Function to fetch commits count for a specific repository
async function fetchCommitCount(repoFullName, username, token) {
    try {
        const url = `https://api.github.com/repos/${repoFullName}/contributors`;
        const headers = {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'  // Ensure proper media type
        };

        const response = await axios.get(url, { headers });
        // Verify if response.data is an array and find the contributor
        const contributors = Array.isArray(response.data) ? response.data : [];
        const contributor = contributors.find(contributor => contributor.login === username);
        return contributor ? contributor.contributions : 0;
    } catch (error) {
        console.error(`Error fetching commits for ${repoFullName}:`, error.message);
        return 0;
    }
}


// Function to fetch repositories the user is a collaborator on
async function fetchCollaboratedRepositories(repoUrls, token) {
    try {
        const headers = {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json'  // Ensure proper media type
        };
        const repos = await Promise.all(repoUrls.map(async url => {
            try {
                const repo = url.split('github.com/')[1];
                const repoData = await axios.get(`https://api.github.com/repos/${repo}`, { headers });
                return repoData.data;
            } catch (error) {
                console.error(`Error fetching collaborated repo ${url}:`, error.message);
                return null;
            }
        }));
        return repos.filter(repo => repo !== null);
    } catch (error) {
        console.error('Error fetching collaborated repositories:', error.message);
        return [];
    }
}

module.exports = {
    fetchUserRepositories,
    fetchCommitCount,
    fetchCollaboratedRepositories
};
