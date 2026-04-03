# gh-stats

A personal GitHub stats dashboard for the [hanthor](https://github.com/hanthor) org, built with React, TypeScript, Vite, and Recharts. Displays commit history, repository stats, top repos, language breakdown, and collaborator activity — all sourced from the GitHub GraphQL API at build time and deployed as a static site.

---

## Highlights — Oct 2025 → Apr 2026

Six months of shipping. Here's what actually happened:

### TunaOS: an enterprise Linux desktop, built from scratch
Launched [tuna-os/tunaOS](https://github.com/tuna-os/tunaOS) — a bootc-native, cloud-native desktop OS for Enterprise Linux (RHEL/AlmaLinux). The org went from a skeleton to a full build pipeline in this window:
- **[fisherman](https://github.com/tuna-os/fisherman)** — a bootc-only installer backend replacing Anaconda
- **[tuna-installer](https://github.com/tuna-os/tuna-installer)** (fork of [Vanilla-OS/vanilla-installer](https://github.com/Vanilla-OS/vanilla-installer)) — GTK 4 / Libadwaita frontend for the installer
- **[bonito-x13s](https://github.com/tuna-os/bonito-x13s)** — dedicated bootc image + live ISO for the Lenovo ThinkPad X13s (aarch64/Qualcomm)
- **[github-copr](https://github.com/tuna-os/github-copr)** — a self-hosted RPM build system using GitHub Actions and Cloudflare R2, because Copr wasn't enough
- **[chunkah](https://github.com/tuna-os/chunkah)** (fork of [coreos/chunkah](https://github.com/coreos/chunkah)) — an OCI re-layering tool for content-based layers (smaller, smarter image updates)
- **[dakota](https://github.com/tuna-os/dakota)** (fork of [projectbluefin/dakota](https://github.com/projectbluefin/dakota)) — the Bluefin buildstream, forked into tuna-os for TunaOS builds
- **[first-setup](https://github.com/tuna-os/first-setup)** (fork of [frostyard/first-setup](https://github.com/frostyard/first-setup)) — GNOME initial-setup replacement for TunaOS

### Bluefin LTS: 19 merged PRs upstream to [ublue-os/bluefin-lts](https://github.com/ublue-os/bluefin-lts)
The most active external project by commit volume. Notable work:
- Backported GNOME 49, then GNOME 50, with a full build pipeline (`GNOME_VERSION` build arg, new CI matrix, hwe/non-hwe variants)
- Fixed GDM boot failures on EL10 bootc images (SELinux policy, mislabeled `/var/home`, DRACUT_TMPDIR export)
- Switched the HWE variant from kmods-sig to the CoreOS kernel
- Ported the ublue-os artwork pipeline to OCI image distribution
- Added TuneD battery/AC auto-switching profiles
- Migrated changelog generation off rechunker and onto SBOM-based tooling

### bluefin-cli: built a cross-platform CLI from zero to Homebrew formula
Started [hanthor/bluefin-cli](https://github.com/hanthor/bluefin-cli) in November 2025. By March 2026 it was:
- Shipping via GoReleaser with automated winget manifests and Homebrew bottles (via [ublue-os/homebrew-experimental-tap](https://github.com/ublue-os/homebrew-experimental-tap))
- Supporting PowerShell/Windows with a ~2900ms → ~140ms profile load speedup after a full refactor
- Built with Charmbracelet v2 (lipgloss, bubbletea), with multi-select install menus, fuzzy finder, and per-category UI
- Using the Fedora countme protocol for anonymous usage telemetry
- Documented cross-platform in [projectbluefin/documentation](https://github.com/projectbluefin/documentation)

### Pasar: a Linux-native Homebrew client
Built [hanthor/Pasar](https://github.com/hanthor/Pasar) — a modern Homebrew GUI for Linux, with full macOS support added in March (native Apple Silicon app bundle, CI release workflow). Includes Brewfile viewing, installed-app icon fetching, and GitHub-avatar-based metadata.

### Homelab monitoring
Stood up [hanthor/homelab-monitoring](https://github.com/hanthor/homelab-monitoring) — Prometheus + Perses across four nodes (kanpur, karnataka, himachal, bihar), with Grafana on the Bihar hub, Loki co-located, and Tailscale for cross-node networking. Managed via Ansible through dotfiles.

### Side projects and experiments
- **[telegramgo](https://github.com/hanthor/telegramgo)** (fork of [mautrix/telegramgo](https://github.com/mautrix/telegramgo)) — Go rewrite of mautrix-telegram, with relay/topic plumbing support for bridging Matrix rooms to Telegram forum topics
- **[oramalama](https://github.com/hanthor/oramalama)** — lifecycle automation for RamaLama and OpenCode on Strix Halo (AMD AI) systems
- **[PSFileIcons](https://github.com/hanthor/PSFileIcons)** — a fast C# replacement for PowerShell Terminal-Icons using Nerd Font glyphs
- **[mattermost-matrix-bridge](https://github.com/hanthor/mattermost-matrix-bridge)** — a Matrix-Mattermost bridge built on mautrix-go, enabling federation on free Mattermost instances
- **[pretalx-chart](https://github.com/hanthor/pretalx-chart)** — production-ready Helm chart for Pretalx conference management
- **[zerobrew](https://github.com/hanthor/zerobrew)** (fork of [lucasgelfond/zerobrew](https://github.com/lucasgelfond/zerobrew)) — contributed Linux support and tap/formula parsing to this experimental Homebrew alternative
- **[lima-container](https://github.com/hanthor/lima-container)** — GNOME Remote Desktop over RDP in bootc builds, using gnome-remote-desktop system service at GDM
- **[x13s-bootc](https://github.com/hanthor/x13s-bootc)** — bootc image work for the ThinkPad X13s (Qualcomm aarch64)
- **[bluespeed](https://github.com/hanthor/bluespeed)** / **[agentic-bluefin](https://github.com/hanthor/agentic-bluefin)** (bluespeed is a fork of [castrojo/bluespeed](https://github.com/castrojo/bluespeed)) — agentic/AI tooling experiments for maintaining Project Bluefin
- Submitted an RFC to AlmaLinux ALESCo for alternative signed kernels

### External contributions (merged)
| Project | What |
|---|---|
| [`ublue-os/bluefin-lts`](https://github.com/ublue-os/bluefin-lts) | 19 PRs merged — GNOME 49/50, kernel fixes, SELinux, GDM, TuneD |
| [`ublue-os/homebrew-experimental-tap`](https://github.com/ublue-os/homebrew-experimental-tap) | 7 PRs — bluefin-cli formula, Cask pipeline, bottle workflow |
| [`projectbluefin/dakota`](https://github.com/projectbluefin/dakota) | 7 PRs — chunkah integration, QEMU VM booting, multi-runner CI |
| [`tuna-os/github-copr`](https://github.com/tuna-os/github-copr) | 6 PRs — GNOME 49/50 RPM pipelines, GDM verification |
| [`ublue-os/homebrew-tap`](https://github.com/ublue-os/homebrew-tap) | 3 PRs — antigravity URL handler, agy alias |
| [`projectbluefin/documentation`](https://github.com/projectbluefin/documentation) | 2 PRs — bluefin-cli cross-platform docs, indiaFOSS talk post |
| [`aedocw/epub2tts-kokoro`](https://github.com/aedocw/epub2tts-kokoro) | Docker auto-detection support |
| [`lucasgelfond/zerobrew`](https://github.com/lucasgelfond/zerobrew) | Linux support + bottle path fix |
| [`ublue-os/artwork`](https://github.com/ublue-os/artwork) | OCI image distribution pipeline |
| [`projectbluefin/iso`](https://github.com/projectbluefin/iso) | Multi-distro ISO build tooling |
| [`hazre/cinny`](https://github.com/hazre/cinny) | Matrix webcam-off default |
| [`ublue-os/bluefin`](https://github.com/ublue-os/bluefin) | Brewfile dependency install step |

### Pattern of work
Almost everything here is in the bootc/OCI/immutable-Linux ecosystem — building, packaging, and deploying cloud-native desktop OS images. Heavy focus on Enterprise Linux desktop (EL10/AlmaLinux + GNOME), Homebrew tooling for Linux, and bridging the gap between container-native infrastructure and end-user desktop experience. Also a recurring theme of "the upstream tooling doesn't exist yet, so build it" — [fisherman](https://github.com/tuna-os/fisherman), [github-copr](https://github.com/tuna-os/github-copr), [chunkah](https://github.com/tuna-os/chunkah), [oramalama](https://github.com/hanthor/oramalama).

---

## Features

- Yearly commit totals and per-repo commit counts across configurable time windows (7D / 1M / 90D / 6M / 1Y / all-time)
- Repository stats: stars, forks, primary language, recent activity
- Collaborator breakdown — lists contributors to your repos including co-authors parsed from commit trailers
- Language distribution pie chart across top repos
- Static build: all GitHub API calls happen at build time; no token is exposed to the browser

## Architecture

```
scripts/fetch-github-data.ts   <- GitHub GraphQL API -> src/data/stats.json
src/App.tsx                    <- React dashboard, reads stats.json at build time
src/CollaboratorModal.tsx      <- Per-collaborator detail modal
.github/workflows/deploy.yml   <- Fetches data + builds + deploys to GitHub Pages
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
- [Recharts](https://recharts.org/) -- charting
- [Lucide React](https://lucide.dev/) -- icons
- [Tailwind CSS](https://tailwindcss.com/)
- [Octokit GraphQL](https://github.com/octokit/graphql.js) -- GitHub API client
