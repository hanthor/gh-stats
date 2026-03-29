import { graphql } from "@octokit/graphql";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = "hanthor";

if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN is not set in .env file.");
  process.exit(1);
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});

async function fetchAllStats() {
  console.log(`Fetching stats for ${USERNAME}...`);

  try {
    // 1. Basic Stats & Years of Contribution
    const userQuery = `
      query($login: String!) {
        user(login: $login) {
          name
          avatarUrl
          repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
            totalCount
            nodes {
              name
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
              createdAt
            }
          }
          pullRequests(states: [OPEN, CLOSED, MERGED]) {
            totalCount
          }
          issues(states: [OPEN, CLOSED]) {
            totalCount
          }
          contributionsCollection {
            contributionYears
          }
        }
      }
    `;

    const userData: any = await graphqlWithAuth(userQuery, { login: USERNAME });
    const user = userData.user;
    const years = user.contributionsCollection.contributionYears;

    console.log(`Found ${years.length} years of contributions. Fetching yearly data...`);

    // 2. Fetch Yearly Contribution Data
    const yearlyStats = [];
    for (const year of years) {
      const start = `${year}-01-01T00:00:00Z`;
      const end = `${year}-12-31T23:59:59Z`;

      const yearQuery = `
        query($login: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $login) {
            contributionsCollection(from: $from, to: $to) {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              totalRepositoryContributions
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
      `;

      const yearData: any = await graphqlWithAuth(yearQuery, { login: USERNAME, from: start, to: end });
      const stats = yearData.user.contributionsCollection;
      yearlyStats.push({
        year,
        commits: stats.totalCommitContributions,
        prs: stats.totalPullRequestContributions,
        issues: stats.totalIssueContributions,
        repos: stats.totalRepositoryContributions,
        calendar: stats.contributionCalendar
      });
    }

    // 3. Fetch Collaborators (Commit Authors)
    // For efficiency, we'll fetch commits from the top 20 repositories by stars
    const topRepos = user.repositories.nodes
      .sort((a: any, b: any) => b.stargazerCount - a.stargazerCount)
      .slice(0, 20);

    console.log(`Fetching collaborators from top ${topRepos.length} repositories...`);

    const collaborators: Map<string, { login: string, name: string, avatarUrl: string, count: number, repos: Set<string> }> = new Map();

    for (const repo of topRepos) {
      console.log(`  Processing ${repo.name}...`);
      const repoQuery = `
        query($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100) {
                    nodes {
                      authors(first: 5) {
                        nodes {
                          name
                          user {
                            login
                            avatarUrl
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const repoData: any = await graphqlWithAuth(repoQuery, { owner: USERNAME, name: repo.name });
        const commits = repoData.repository?.defaultBranchRef?.target?.history?.nodes || [];

        for (const commit of commits) {
          for (const authorNode of commit.authors.nodes) {
            const login = authorNode.user?.login;
            if (login && login !== USERNAME && !login.includes("[bot]")) {
              if (!collaborators.has(login)) {
                collaborators.set(login, {
                  login,
                  name: authorNode.name,
                  avatarUrl: authorNode.user.avatarUrl,
                  count: 0,
                  repos: new Set()
                });
              }
              const collaborator = collaborators.get(login)!;
              collaborator.count++;
              collaborator.repos.add(repo.name);
            }
          }
        }
      } catch (e) {
        console.warn(`    Failed to fetch commits for ${repo.name}:`, e);
      }
    }

    const collaboratorsList = Array.from(collaborators.values())
      .map(c => ({ ...c, repos: Array.from(c.repos) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // 4. Save Final Data
    const finalData = {
      user: {
        login: USERNAME,
        name: user.name,
        avatarUrl: user.avatarUrl,
        totalRepos: user.repositories.totalCount,
        totalPRs: user.pullRequests.totalCount,
        totalIssues: user.issues.totalCount,
      },
      yearlyStats: yearlyStats.reverse(),
      topRepos,
      collaborators: collaboratorsList,
      updatedAt: new Date().toISOString(),
    };

    const outputPath = path.join(process.cwd(), "src/data/stats.json");
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`Success! Data saved to ${outputPath}`);

  } catch (error) {
    console.error("Error fetching data:", error);
    process.exit(1);
  }
}

fetchAllStats();
