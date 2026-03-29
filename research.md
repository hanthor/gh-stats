# Research Report: Fetching All-Time GitHub Contributions

## Overview
This report analyzes the best approach for fetching all-time contribution data (commits, PRs, issues) for a user with ~130 repositories to be displayed on a static site (GitHub Pages).

## 1. REST vs. GraphQL API

| Feature | REST API (v3) | GraphQL API (v4) |
| :--- | :--- | :--- |
| **All-Time Totals** | Limited. Search API is capped at **1,000 results**. | Direct `totalCount` fields for PRs and Issues. |
| **Commits** | Requires searching or iterating per repo. | Use `contributionsCollection` (requires yearly iteration). |
| **Efficiency** | **Low.** Multiple calls required per repository/type. | **High.** Fetch aggregates for multiple types in one query. |
| **Rate Limits** | 5,000 requests/hour. | 5,000 points/hour (Complexity-based). |

### GraphQL Recommendation
**GraphQL is the clear winner** for this use case. 
- **PRs & Issues:** A single query can return the `totalCount` of all PRs and Issues authored by the user across all repositories, even if they exceed 1,000.
- **Commits:** While GitHub doesn't have a single "all-time commit" field, you can query `contributionsCollection` for each year. For a user with ~130 repos, this is far more efficient than the REST Search API which would truncate results at 1,000.

## 2. Rate Limits & Complexity
- **REST:** 5,000 requests per hour. Fetching detailed stats for 130 repos would likely consume hundreds of requests.
- **GraphQL:** 5,000 points per hour. A query for all-time aggregates typically costs < 10 points. 
- **Secondary Limits:** Both APIs have "abuse" or secondary limits. High-frequency polling is discouraged, but build-time fetching (once per day/commit) is perfectly safe.

## 3. Implementation Strategy for Static Sites
Since GitHub Pages is static, you should **never** call the GitHub API directly from the client-side browser code (this would expose your Personal Access Token).

### Recommended Workflow: Build-Time Data Fetching
1. **GitHub Action:** Create a workflow that runs on a schedule (e.g., daily) or on push.
2. **Data Script:** Use a small script (Node.js/Python) to execute the GraphQL query.
3. **Storage:** Save the result as a JSON file (e.g., `data/stats.json`) in your repository.
4. **Site Build:** Your static site generator (Jekyll, Hugo, Eleventy, etc.) reads this JSON and generates the HTML.

## 4. Existing Tools & Libraries
To avoid "reinventing the wheel," consider these tools:

### Visual/Component Tools
- **[github-calendar](https://github.com/Bloggify/github-calendar):** Scrapes the GitHub profile and renders the contribution heat map. Note: It relies on a proxy and mainly shows the recent year.
- **[react-github-calendar](https://github.com/grubersjoe/react-github-calendar):** Excellent if your site uses React.

### Image-Based (Easy Integration)
- **[GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats):** Highly customizable cards showing total commits, PRs, issues, etc. Can be embedded via `<img>` tags on any static site.
- **[ghchart](https://ghchart.rshah.org/):** Generates an SVG image of the contribution graph.

### Data-Centric Tools
- **[github-stats-box](https://github.com/matchai/waka-box-codesandbox):** Often used for Gists, but logic can be adapted.
- **[github-profile-summary-cards](https://github.com/vn7n24fzkq/github-profile-summary-cards):** Generates comprehensive stats cards via GitHub Actions.

## 5. Conclusion
For a user with ~130 repos, **custom GraphQL fetching via a GitHub Action** is the most robust and accurate method for "all-time" stats. If you only need a visual card, **GitHub Readme Stats** is the easiest "no-code" alternative.

### Sample GraphQL Query for All-Time Aggregates
```graphql
query {
  user(login: "USERNAME") {
    pullRequests {
      totalCount
    }
    issues {
      totalCount
    }
    repositoriesContributedTo(contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, PULL_REQUEST_REVIEW]) {
      totalCount
    }
    # For commits, iterate through years obtained from:
    contributionsCollection {
      contributionYears
    }
  }
}
```

## 6. Fetching Collaborators & Co-authors

### The `authors` Connection in GraphQL
While the standard Git `author` field only identifies the primary contributor, the GitHub GraphQL API provides an **`authors` connection** on the `Commit` object. This connection is specifically designed to include both the primary author and any **co-authors** credited in the commit message via the `Co-authored-by:` trailer.

- **Inclusion of Co-authors:** GitHub automatically parses `Co-authored-by: Name <email>` trailers in commit messages. The `authors` field on a `Commit` returns a `GitActorConnection` containing both the primary author and these co-authors.
- **REST vs. GraphQL:** The REST API's `contributors` endpoint **does not** include co-authors, making GraphQL the required tool for identifying all collaborators.

### Recommended GraphQL Fragment for Commit Authors
```graphql
fragment CommitAuthors on Commit {
  oid
  authors(first: 5) {
    nodes {
      name
      email
      user {
        login
        avatarUrl
      }
    }
  }
}
```

## 7. Efficient Strategy for ~130 Repositories

### Challenges
Fetching every commit for 130 repositories to check for co-authors is a high-volume operation. 
1. **Query Complexity:** Paginating through thousands of commits across 130 repos can hit complexity limits.
2. **Rate Limits:** Multiple requests are required to cover full histories.

### Strategy: Aggregated Build-Time Fetching
To efficiently process the data for "hanthor"'s repositories:

1. **Discovery:** Use `user(login: "hanthor") { repositories(first: 100, isFork: false) { ... } }` to get original repositories.
2. **Batching:** Use **GraphQL Aliases** to query the commit history of multiple repositories (e.g., 5-10 at a time) in a single request to reduce round-trips.
3. **Pagination:** Use the `history` connection with `first: 100`. Only fetch the `authors` field to minimize response size.
4. **Data Aggregation:** 
   - Use a build-time script (Node.js) to execute queries.
   - Maintain a Map to track `login -> { commitCount, reposContributedTo, avatarUrl }`.
   - Filter out the owner ("hanthor") and known bot accounts (e.g., `dependabot[bot]`).
5. **Output:** Sort by `commitCount` and save to `data/collaborators.json`.

### Example Aggregated JSON Structure
```json
{
  "updatedAt": "2023-10-27T10:00:00Z",
  "collaborators": [
    {
      "login": "octocat",
      "avatarUrl": "https://...",
      "commits": 124,
      "repos": ["repo-a", "repo-b"],
      "lastActive": "2023-09-15"
    }
  ]
}
```
