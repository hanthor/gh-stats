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

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

type CommitPeriods = { total: number; d7: number; d30: number; d90: number; d180: number; d365: number };

async function fetchRepoCommitStats(owner: string, repo: string, userId: string): Promise<CommitPeriods> {
  const zero: CommitPeriods = { total: 0, d7: 0, d30: 0, d90: 0, d180: 0, d365: 0 };
  try {
    const data: any = await graphqlWithAuth(`
      query($owner: String!, $repo: String!, $userId: ID!, $s7: GitTimestamp!, $s30: GitTimestamp!, $s90: GitTimestamp!, $s180: GitTimestamp!, $s365: GitTimestamp!) {
        repository(owner: $owner, name: $repo) {
          defaultBranchRef {
            target {
              ... on Commit {
                total:  history(author: { id: $userId })              { totalCount }
                d7:     history(author: { id: $userId }, since: $s7)   { totalCount }
                d30:    history(author: { id: $userId }, since: $s30)  { totalCount }
                d90:    history(author: { id: $userId }, since: $s90)  { totalCount }
                d180:   history(author: { id: $userId }, since: $s180) { totalCount }
                d365:   history(author: { id: $userId }, since: $s365) { totalCount }
              }
            }
          }
        }
      }
    `, {
      owner, repo, userId,
      s7:   daysAgo(7),
      s30:  daysAgo(30),
      s90:  daysAgo(90),
      s180: daysAgo(180),
      s365: daysAgo(365),
    });
    const t = data.repository?.defaultBranchRef?.target;
    return {
      total: t?.total?.totalCount  ?? 0,
      d7:    t?.d7?.totalCount     ?? 0,
      d30:   t?.d30?.totalCount    ?? 0,
      d90:   t?.d90?.totalCount    ?? 0,
      d180:  t?.d180?.totalCount   ?? 0,
      d365:  t?.d365?.totalCount   ?? 0,
    };
  } catch (e) {
    if (e instanceof GraphqlResponseError && e.data) {
      const t = e.data.repository?.defaultBranchRef?.target;
      return {
        total: t?.total?.totalCount  ?? 0,
        d7:    t?.d7?.totalCount     ?? 0,
        d30:   t?.d30?.totalCount    ?? 0,
        d90:   t?.d90?.totalCount    ?? 0,
        d180:  t?.d180?.totalCount   ?? 0,
        d365:  t?.d365?.totalCount   ?? 0,
      };
    }
    return zero;
  }
}

async function fetchCollaboratorPRs(login: string): Promise<Array<{
  number: number; title: string; state: string; url: string; repoName: string; createdAt: string;
}>> {
  try {
    const data: any = await graphqlWithAuth(`
      query($query: String!) {
        search(query: $query, type: ISSUE, first: 30) {
          nodes {
            ... on PullRequest {
              number title state url
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
    // 1. User info + all public repos (owned, including forks)
    let userData: any;
    try {
      userData = await graphqlWithAuth(`
        query($login: String!) {
          user(login: $login) {
            id name avatarUrl
            repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: { field: PUSHED_AT, direction: DESC }) {
              totalCount
              nodes {
                name isFork stargazerCount forkCount pushedAt createdAt
                primaryLanguage { name color }
                parent { nameWithOwner }
              }
            }
            pullRequests(states: [OPEN, CLOSED, MERGED]) { totalCount }
            issues(states: [OPEN, CLOSED]) { totalCount }
            contributionsCollection { contributionYears }
          }
        }
      `, { login: USERNAME });
    } catch (e) {
      if (e instanceof GraphqlResponseError && e.data?.user) {
        console.warn("Warning: partial GraphQL errors (org token restrictions). Continuing with available data.");
        userData = e.data;
      } else {
        throw e;
      }
    }

    const user = userData.user;
    const userId: string = user.id;
    const allRepos = user.repositories.nodes;
    const ownedRepos  = allRepos.filter((r: any) => !r.isFork);
    const forkedRepos = allRepos.filter((r: any) =>  r.isFork);
    const recentRepos = allRepos.filter((r: any) => new Date(r.pushedAt) >= ONE_YEAR_AGO);
    const years = user.contributionsCollection.contributionYears;

    console.log(`${ownedRepos.length} owned, ${forkedRepos.length} forks, ${recentRepos.length} active in past year`);

    // 2. Yearly contribution data
    console.log(`\nFetching ${years.length} years of contributions...`);
    const yearlyStats = [];
    for (const year of years) {
      let yearData: any;
      try {
        yearData = await graphqlWithAuth(`
          query($login: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $login) {
              contributionsCollection(from: $from, to: $to) {
                totalCommitContributions totalPullRequestContributions
                totalIssueContributions totalRepositoryContributions
                contributionCalendar {
                  totalContributions
                  weeks { contributionDays { contributionCount date } }
                }
              }
            }
          }
        `, { login: USERNAME, from: `${year}-01-01T00:00:00Z`, to: `${year}-12-31T23:59:59Z` });
      } catch (e) {
        if (e instanceof GraphqlResponseError && e.data?.user) {
          yearData = e.data;
        } else {
          console.warn(`  Skipping ${year}: ${e}`);
          continue;
        }
      }
      const s = yearData.user.contributionsCollection;
      yearlyStats.push({
        year,
        commits: s.totalCommitContributions,
        prs:     s.totalPullRequestContributions,
        issues:  s.totalIssueContributions,
        repos:   s.totalRepositoryContributions,
        calendar: s.contributionCalendar,
      });
    }

    // 3. Commit stats per repo + fork (combined, all periods in one query each)
    const reposToScan  = ownedRepos.slice(0, 40);
    const forksToScan  = forkedRepos.slice(0, 20);
    const allToScan    = [...reposToScan, ...forksToScan];

    console.log(`\nFetching commit stats for ${reposToScan.length} repos + ${forksToScan.length} forks...`);

    const myCommitStats: Array<{
      name: string; isFork: boolean; parentNameWithOwner: string;
      stargazerCount: number; forkCount: number;
      primaryLanguage: { name: string; color: string } | null;
      commits: CommitPeriods;
    }> = [];

    for (const repo of allToScan) {
      process.stdout.write(`  ${repo.isFork ? "⑂ " : "  "}${repo.name}... `);
      const commits = await fetchRepoCommitStats(USERNAME, repo.name, userId);
      process.stdout.write(`${commits.d365} (1Y) / ${commits.total} (all-time)\n`);
      if (commits.total > 0) {
        myCommitStats.push({
          name: repo.name,
          isFork: repo.isFork,
          parentNameWithOwner: repo.parent?.nameWithOwner ?? "",
          stargazerCount: repo.stargazerCount,
          forkCount: repo.forkCount,
          primaryLanguage: repo.primaryLanguage ?? null,
          commits,
        });
      }
    }
    // Default sort: by all-time total
    myCommitStats.sort((a, b) => b.commits.total - a.commits.total);

    // 4. Collaborators
    const topReposByStars = [...ownedRepos]
      .sort((a: any, b: any) => b.stargazerCount - a.stargazerCount)
      .slice(0, 30);

    console.log(`\nFetching collaborators from top ${topReposByStars.length} repos...`);

    type CollabEntry = { login: string; name: string; avatarUrl: string; repos: Map<string, number> };
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
                          nodes { name user { login avatarUrl } }
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
          for (const a of commit.authors.nodes) {
            const login = a.user?.login;
            if (login && login !== USERNAME && !login.includes("[bot]")) {
              if (!collaboratorsMap.has(login)) {
                collaboratorsMap.set(login, { login, name: a.name, avatarUrl: a.user.avatarUrl, repos: new Map() });
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

    // 5. Collaborator PRs
    const collaboratorsList = Array.from(collaboratorsMap.values())
      .map((c) => ({
        login: c.login, name: c.name, avatarUrl: c.avatarUrl,
        count: Array.from(c.repos.values()).reduce((s, n) => s + n, 0),
        repos: Array.from(c.repos.entries()).map(([name, commits]) => ({ name, commits })),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    console.log(`\nFetching PRs for ${collaboratorsList.length} collaborators...`);
    const collaboratorsWithPRs = await Promise.all(
      collaboratorsList.map(async (c) => {
        process.stdout.write(`  ${c.login}... `);
        const prs = await fetchCollaboratorPRs(c.login);
        process.stdout.write(`${prs.length} PRs\n`);
        return { ...c, prs };
      })
    );

    // 6. Save
    const finalData = {
      user: {
        login: USERNAME, name: user.name, avatarUrl: user.avatarUrl,
        totalRepos: user.repositories.totalCount,
        totalPRs: user.pullRequests.totalCount,
        totalIssues: user.issues.totalCount,
      },
      yearlyStats: yearlyStats.reverse(),
      recentRepos,
      topRepos: ownedRepos
        .sort((a: any, b: any) => b.stargazerCount - a.stargazerCount)
        .slice(0, 20),
      myCommitStats,
      collaborators: collaboratorsWithPRs,
      updatedAt: new Date().toISOString(),
    };

    const outputPath = path.join(process.cwd(), "src/data/stats.json");
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`\nDone! Saved to ${outputPath}`);
    console.log(`  ${myCommitStats.length} repos/forks with commit stats`);
    console.log(`  ${collaboratorsWithPRs.length} collaborators`);

  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

fetchAllStats();
