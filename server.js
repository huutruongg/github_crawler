const express = require('express');
const { fetchUserRepositories, fetchCollaboratedRepositories } = require('./githubService');
const { calculateTotalScore } = require('./scoringService');

const app = express();
app.use(express.json());

app.post('/calculate-score', async (req, res) => {
    const { selfCreatedRepoUrl, sharedRepoUrl, JD_laguages_required, token } = req.body;

    // Extract username from GitHub URL
    const username = selfCreatedRepoUrl.split('github.com/')[1];
    
    try {
        // Fetch the candidate's own repositories
        const selfCreatedRepos = await fetchUserRepositories(username, token);

        // Fetch repositories shared with the candidate (collaborated on)
        const sharedRepos = await fetchCollaboratedRepositories(sharedRepoUrl, token);

        // Combine all repositories (self-created + collaborated)
        const allRepos = [...selfCreatedRepos, ...sharedRepos];

        // Calculate the total score
        const totalScore = await calculateTotalScore(allRepos, JD_laguages_required, selfCreatedRepos.map(repo => repo.full_name), username, token);

        res.json({ totalScore, allRepos });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to calculate score' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
