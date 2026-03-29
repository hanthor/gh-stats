import { graphql, GraphqlResponseError } from "@octokit/graphql";
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
  headers: { authorization: `token ${GITHUB_TOKEN}` },
});

const ONE_YEAR_AGO = new Date();
ONE_YEAR_AGO.setFullYear(ONE_YEAR_AGO.getFullYear() - 1);

async function fetchCommitCountByUser(owner: string, repo: string, userId: string): Promise<number> {
  try {
    const data: any = await graphqlWithAuth(`
      query($owner: String!, $repo: String!, $userId: ID!) {
        repository(owner: $owner, name: $repo) {
          defaultBranchRef {
            target {
              ... on Commit {
                history(author: { id: $userId }) {
                  totalCount
                }
              }
            }
          }
        }
      }
    `, { owner, repo, userId });
    return data.repository?.defaultBranchRef?.target?.history?.totalCount ?? 0;
  } catch (e) {
    if (e instanceof GraphqlResponseError) {
      return e.data?.repository?.defaultBranchRef?.target?.history?.totalCount ?? 0;
    }
    return 0;
  }
}

async function fetchCollaboratorPRs(login: string): Promise<Array<{
  number: number;
  title: string;
  state: string;
  url: string;
  repoName: string;
  createdAt: string;
}>> {
  try {
    const data: any = await graphqlWithAuth(`
      query($query: String!) {
        search(query: $query, type: ISSUE, first: 30) {
          nodes {
            ... on PullRequest {
              number
              title
              state
              url
              repository { name }
              createdAt
            }
          }
        }
      }
    `, { query: `author:${login} is:pr user:${USERNAME}` });

    return (data.search?.nodes ?? [])
      .filter((n: any) => n.number != null)
      .map((n: any) => ({
        number: n.number,
        title: n.title,
        state: n.state,
        url: n.url,
        repoName: n.repository.name,
        createdAt: n.createdAt,
      }));
  } catch {
    return [];
  }
}

async function fetchAllStats() {
  console.log(`Fetching stats for ${USERNAME}...`);

  try {
    // 1. Basic user info + all repos (public only, owned, including forks)
    const userData: any = await graphqlWithAuth(`
      query($login: String!) {
        user(login: $login) {
          id
          name
          avatarUrl
          repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: { field: PUSHED_AT, direction: DESC }) {
            totalCount
            nodes {
              name
              isFork
              stargazerCount
              forkCount
              pushedAt
              primaryLanguage { name color }
              createdAt
              parent { nameWithOwner }
            }
          }
          pullRequests(states: [OPEN, CLOSED, MERGED]) { totalCount }
          issues(states: [OPEN, CLOSED]) { totalCount }
          contributionsCollection { contributionYears }
        }
      }
    `, { login: USERNAME });

    const user = userData.user;
    const userId: string = user.id;
    const allRepos = user.repositories.nodes;
    const ownedRepos = allRepos.filter((r: any) => !r.isFork);
    const forkedRepos = allRepos.filter((r: any) => r.isFork);
    const recentRepos = allRepos.filter((r: any) => new Date(r.pushedAt) >= ONE_YEAR_AGO);
    const years = user.contributionsCollection.contributionYears;

    console.log(`${ownedRepos.length} owned repos, ${forkedRepos.length} forks, ${recentRepos.length} active in past year.`);

    // 2. Yearly contribution data
    console.log(`Fetching ${years.length} years of contribution data...`);
    const yearlyStats = [];
    for (const year of years) {
      const yearData: any = await graphqlWithAuth(`
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
                  contributionDays { contributionCount date }
                }
              }
            }
          }
        }
      `, {
        login: USERNAME,
        from: `${year}-01-01T00:00:00Z`,
        to: `${year}-12-31T23:59:59Z`,
      });
      const stats = yearData.user.contributionsCollection;
      yearlyStats.push({
        year,
        commits: stats.totalCommitContributions,
        prs: stats.totalPullRequestContributions,
        issues: stats.totalIssueContributions,
        repos: stats.totalRepositoryContributions,
        calendar: stats.contributionCalendar,
      });
    }

    // 3. Commits-by-me per owned repo (top 40 by pushedAt)
    const reposToScan = ownedRepos.slice(0, 40);
    console.log(`\nFetching commit counts for ${reposToScan.length} owned repos...`);
    const myTopRepos: Array<{
      name: string; myCommitCount: number; stargazerCount: number;
      forkCount: number; primaryLanguage: { name: string; color: string } | null;
    }> = [];

    for (const repo of reposToScan) {
      process.stdout.write(`  ${repo.name}... `);
      const count = await fetchCommitCountByUser(USERNAME, repo.name, userId);
      process.stdout.write(`${count}\n`);
      if (count > 0) {
        myTopRepos.push({
          name: repo.name,
          myCommitCount: count,
          stargazerCount: repo.stargazerCount,
          forkCount: repo.forkCount,
          primaryLanguage: repo.primaryLanguage ?? null,
        });
      }
    }
    myTopRepos.sort((a, b) => b.myCommitCount - a.myCommitCount);

    // 4. Commits-by-me per fork (top 20 by pushedAt)
    const forksToScan = forkedRepos.slice(0, 20);
    console.log(`\nFetching commit counts for ${forksToScan.length} forks...`);
    const myTopForks: Array<{
      name: string; myCommitCount: number; parentNameWithOwner: string;
      stargazerCount: number; primaryLanguage: { name: string; color: string } | null;
    }> = [];

    for (const repo of forksToScan) {
      process.stdout.write(`  ${repo.name}... `);
      const count = await fetchCommitCountByUser(USERNAME, repo.name, userId);
      process.stdout.write(`${count}\n`);
      if (count > 0) {
        myTopForks.push({
          name: repo.name,
          myCommitCount: count,
          parentNameWithOwner: repo.parent?.nameWithOwner ?? "",
          stargazerCount: repo.stargazerCount,
          primaryLanguage: repo.primaryLanguage ?? null,
        });
      }
    }
    myTopForks.sort((a, b) => b.myCommitCount - a.myCommitCount);

    // 5. Collaborators from top 30 repos by stars
    const topReposByStars = [...ownedRepos]
      .sort((a: any, b: any) => b.stargazerCount - a.stargazerCount)
      .slice(0, 30);

    console.log(`\nFetching collaborators from top ${topReposByStars.length} repos by stars...`);

    type CollabEntry = {
      login: string; name: string; avatarUrl: string;
      repos: Map<string, number>;
    };
    const collaboratorsMap = new Map<string, CollabEntry>();

    for (const repo of topReposByStars) {
      process.stdout.write(`  ${repo.name}... `);
      try {
        const repoData: any = await graphqlWithAuth(`
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
                            user { login avatarUrl }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `, { owner: USERNAME, name: repo.name });

        const commits = repoData.repository?.defaultBranchRef?.target?.history?.nodes ?? [];
        let found = 0;
        for (const commit of commits) {
          for (const authorNode of commit.authors.nodes) {
            const login = authorNode.user?.login;
            if (login && login !== USERNAME && !login.includes("[bot]")) {
              if (!collaboratorsMap.has(login)) {
                collaboratorsMap.set(login, {
                  login,
                  name: authorNode.name,
                  avatarUrl: authorNode.user.avatarUrl,
                  repos: new Map(),
                });
              }
              const entry = collaboratorsMap.get(login)!;
              entry.repos.set(repo.name, (entry.repos.get(repo.name) ?? 0) + 1);
              found++;
            }
          }
        }
        process.stdout.write(`${found} co-author commits\n`);
      } catch (e) {
        console.warn(`\n    Failed: ${e}`);
      }
    }

    // 6. Fetch PRs for each collaborator
    const collaboratorsList = Array.from(collaboratorsMap.values())
      .map((c) => ({
        login: c.login,
        name: c.name,
        avatarUrl: c.avatarUrl,
        count: Array.from(c.repos.values()).reduce((s, n) => s + n, 0),
        repos: Array.from(c.repos.entries()).map(([name, commits]) => ({ name, commits })),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    console.log(`\nFetching PRs for ${collaboratorsList.length} collaborators...`);
    const collaboratorsWithPRs = await Promise.all(
      collaboratorsList.map(async (collab) => {
        process.stdout.write(`  ${collab.login}... `);
        const prs = await fetchCollaboratorPRs(collab.login);
        process.stdout.write(`${prs.length} PRs\n`);
        return { ...collab, prs };
      })
    );

    // 7. Save
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
      recentRepos,
      topRepos: ownedRepos
        .sort((a: any, b: any) => b.stargazerCount - a.stargazerCount)
        .slice(0, 20),
      myTopRepos: myTopRepos.slice(0, 15),
      myTopForks: myTopForks.slice(0, 10),
      collaborators: collaboratorsWithPRs,
      updatedAt: new Date().toISOString(),
    };

    const outputPath = path.join(process.cwd(), "src/data/stats.json");
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`\nDone! Saved to ${outputPath}`);
    console.log(`  ${myTopRepos.length} owned repos with commit counts`);
    console.log(`  ${myTopForks.length} forks with commit counts`);
    console.log(`  ${collaboratorsWithPRs.length} collaborators with PR data`);

  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

fetchAllStats();
