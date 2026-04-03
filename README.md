# gh-stats

A personal GitHub stats dashboard for the [hanthor](https://github.com/hanthor) org, built with React, TypeScript, Vite, and Recharts. Displays commit history, repository stats, top repos, language breakdown, and collaborator activity — all sourced from the GitHub GraphQL API at build time and deployed as a static site.

## Features

- Yearly commit totals and per-repo commit counts across configurable time windows (7D / 1M / 90D / 6M / 1Y / all-time)
- Repository stats: stars, forks, primary language, recent activity
- Collaborator breakdown — lists contributors to your repos including co-authors parsed from commit trailers
- Language distribution pie chart across top repos
- Static build: all GitHub API calls happen at build time; no token is exposed to the browser

## Architecture

```
scripts/fetch-github-data.ts   ← GitHub GraphQL API → src/data/stats.json
src/App.tsx                    ← React dashboard, reads stats.json at build time
src/CollaboratorModal.tsx      ← Per-collaborator detail modal
.github/workflows/deploy.yml   ← Fetches data + builds + deploys to GitHub Pages
```

Data is fetched once (at CI build time) and baked into the static bundle. The site is deployed to GitHub Pages.

## Local Development

### Prerequisites

- Node.js 20+
- A GitHub Personal Access Token with `read:user` and `repo` scopes

### Setup

```bash
git clone https://github.com/hanthor/gh-stats.git
cd gh-stats
npm install
cp .env.example .env
# Edit .env and set GITHUB_TOKEN=your_token_here
```

### Fetch stats data

```bash
npm run fetch-data
```

This runs `scripts/fetch-github-data.ts` via `tsx` and writes `src/data/stats.json`.

### Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
```

Output lands in `dist/`.

## Deployment

The `deploy.yml` GitHub Actions workflow:

1. Checks out the repo
2. Installs dependencies
3. Fetches fresh stats data using the `GITHUB_TOKEN` secret
4. Builds the site
5. Deploys to GitHub Pages

The workflow runs on push to `main` and can be triggered manually.

## Configuration

The data fetch script is hardcoded to the `hanthor` GitHub user. To adapt it for a different account, edit `scripts/fetch-github-data.ts` and change the `USERNAME` constant.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Recharts](https://recharts.org/) — charting
- [Lucide React](https://lucide.dev/) — icons
- [Tailwind CSS](https://tailwindcss.com/)
- [Octokit GraphQL](https://github.com/octokit/graphql.js) — GitHub API client
