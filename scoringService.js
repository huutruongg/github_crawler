const { fetchCommitCount } = require('./githubService');

// Function to calculate score based on repo language and JD requirements
function calculateLanguageScore(repoLanguage, JD_languages_required) {
    const languageMatch = JD_languages_required.some(language => language.toLowerCase() === repoLanguage.toLowerCase());
    return languageMatch ? 5 : 0; // +5 điểm nếu ngôn ngữ khớp với JD
}

async function calculateCommitScore(repoFullName, username, token, isSelfCreated, repoLanguage, jdLanguages) {
    const commitCount = await fetchCommitCount(repoFullName, username, token);
    
    // Check if the repository language matches JD languages
    if (jdLanguages.includes(repoLanguage)) {
        if (isSelfCreated) {
            return commitCount * 0.5 + 5; // 0.5 điểm mỗi commit và +5 điểm cho phạm vi rộng
        } else {
            return commitCount * 0.5; // 0.5 điểm mỗi commit cho repo chia sẻ
        }
    } else {
        return 0; // Không khớp ngôn ngữ, điểm = 0
    }
}

async function calculateTotalScore(repos, JD_languages_required, selfCreatedRepos, username, token) {
    let totalScore = 0;

    for (const repo of repos) {
        let score = 0;
        const isSelfCreated = selfCreatedRepos.includes(repo.name);
        const repoLanguage = repo.language || '';

        // Tính điểm ngôn ngữ
        score += calculateLanguageScore(repoLanguage, JD_languages_required);

        // Tính điểm commit
        score += await calculateCommitScore(repo.full_name, username, token, isSelfCreated, repoLanguage, JD_languages_required);
        console.log(repo.name + ": " + score + ", language: " + repoLanguage);

        // Thêm điểm cho repo cá nhân (nhân với 1.5)
        totalScore += isSelfCreated ? score * 1.5 : score;
    }

    return totalScore;
}

module.exports = {
    calculateTotalScore
};
