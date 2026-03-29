import { useMemo, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import {
  Github, GitPullRequest, Star, GitFork, Users, Calendar,
  ExternalLink, Info, GitCommitHorizontal, CircleDot,
} from 'lucide-react';
import statsData from './data/stats.json';
import CollaboratorModal, { type Collaborator } from './CollaboratorModal';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function App() {
  const { user, yearlyStats, recentRepos, topRepos, myTopRepos, myTopForks, collaborators, updatedAt } = statsData;
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const closeModal = useCallback(() => setSelectedCollaborator(null), []);

  const totalCommits = useMemo(() =>
    yearlyStats.reduce((acc, curr) => acc + curr.commits, 0),
  [yearlyStats]);

  const languageData = useMemo(() => {
    const langMap = new Map<string, { name: string; color: string; count: number }>();
    for (const repo of topRepos) {
      if (repo.primaryLanguage) {
        const { name, color } = repo.primaryLanguage;
        const existing = langMap.get(name);
        if (existing) existing.count++;
        else langMap.set(name, { name, color, count: 1 });
      }
    }
    return Array.from(langMap.values()).sort((a, b) => b.count - a.count);
  }, [topRepos]);

  const maxMyCommits = myTopRepos[0]?.myCommitCount ?? 1;
  const maxForkCommits = myTopForks[0]?.myCommitCount ?? 1;

  return (
    <>
      {selectedCollaborator && (
        <CollaboratorModal
          collaborator={selectedCollaborator}
          ownerLogin={user.login}
          onClose={closeModal}
        />
      )}

      <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer">
              <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full ring-2 ring-indigo-500 hover:ring-indigo-400 transition-all" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.name}'s GitHub Stats</h1>
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 flex items-center gap-1 hover:text-indigo-600 transition-colors"
              >
                <Github size={16} /> @{user.login} • Last updated: {new Date(updatedAt).toLocaleDateString()}
              </a>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 overflow-x-auto">
            <StatCard icon={<Star className="text-yellow-500" />} label="Repos" value={user.totalRepos} />
            <StatCard icon={<GitPullRequest className="text-green-500" />} label="PRs" value={user.totalPRs} />
            <StatCard icon={<CircleDot className="text-red-500" />} label="Issues" value={user.totalIssues} />
            <StatCard icon={<GitCommitHorizontal className="text-indigo-500" />} label="All-time Commits" value={totalCommits} />
          </div>
        </header>

        {/* Contributions + Collaborators bar chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-indigo-500" />
              <h2 className="text-lg font-semibold">Contributions Over Time</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="commits" name="Commits" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="prs" name="PRs" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="issues" name="Issues" stroke="#ff8042" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 justify-center text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-[#8884d8] inline-block" /> Commits</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-[#82ca9d] inline-block" /> PRs</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-[#ff8042] inline-block" /> Issues</span>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Users className="text-indigo-500" />
              <h2 className="text-lg font-semibold">Top Collaborators & Co-Authors</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collaborators} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="login" type="category" width={80} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {collaborators.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Most committed repos + forks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <GitCommitHorizontal className="text-indigo-500" />
              <h2 className="text-lg font-semibold">Your Most Committed Repos</h2>
            </div>
            <div className="space-y-3">
              {myTopRepos.map((repo, i) => (
                <a
                  key={repo.name}
                  href={`https://github.com/${user.login}/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <span className="text-xs font-bold text-slate-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {repo.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono ml-2 flex-shrink-0">
                        {repo.myCommitCount.toLocaleString()} commits
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 rounded-full transition-all"
                        style={{ width: `${(repo.myCommitCount / maxMyCommits) * 100}%` }}
                      />
                    </div>
                    {repo.primaryLanguage && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }} />
                        <span className="text-xs text-slate-400">{repo.primaryLanguage.name}</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <GitFork className="text-indigo-500" />
              <h2 className="text-lg font-semibold">Your Most Committed Forks</h2>
            </div>
            {myTopForks.length === 0 ? (
              <p className="text-sm text-slate-400">No fork commit data yet.</p>
            ) : (
              <div className="space-y-3">
                {myTopForks.map((fork, i) => (
                  <a
                    key={fork.name}
                    href={`https://github.com/${user.login}/${fork.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <span className="text-xs font-bold text-slate-300 w-5 text-right flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {fork.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono ml-2 flex-shrink-0">
                          {fork.myCommitCount.toLocaleString()} commits
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 rounded-full transition-all"
                          style={{ width: `${(fork.myCommitCount / maxForkCommits) * 100}%` }}
                        />
                      </div>
                      {fork.parentNameWithOwner && (
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          ↑ {fork.parentNameWithOwner}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Top repos by stars + language breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Star className="text-yellow-500" />
              <h2 className="text-lg font-semibold">Top Repositories by Stars</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRepos.map((repo) => (
                <a
                  key={repo.name}
                  href={`https://github.com/${user.login}/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-colors block"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {repo.name}
                      <ExternalLink size={14} className="text-slate-400" />
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Star size={14} /> {repo.stargazerCount}</span>
                      <span className="flex items-center gap-1"><GitFork size={14} /> {repo.forkCount}</span>
                    </div>
                  </div>
                  {repo.primaryLanguage && (
                    <div className="flex items-center gap-2 text-sm mt-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }} />
                      <span className="text-slate-600">{repo.primaryLanguage.name}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <GitCommitHorizontal className="text-indigo-500" />
              <h2 className="text-lg font-semibold">Language Breakdown</h2>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={languageData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {languageData.map((lang, index) => (
                      <Cell key={lang.name} fill={lang.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number, name: string) => [`${value} repos`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {languageData.map((lang, index) => (
                <div key={lang.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: lang.color || COLORS[index % COLORS.length] }} />
                    <span className="text-slate-700">{lang.name}</span>
                  </div>
                  <span className="text-slate-400 font-medium">{lang.count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* All projects active in the past year */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-indigo-500" />
              <h2 className="text-lg font-semibold">Active Projects — Past Year</h2>
            </div>
            <span className="text-sm text-slate-400 font-medium">{recentRepos.length} repos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {recentRepos.map((repo) => (
              <a
                key={repo.name}
                href={`https://github.com/${user.login}/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate flex items-center gap-1">
                    {repo.name}
                    <ExternalLink size={12} className="text-slate-400 flex-shrink-0" />
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {repo.primaryLanguage && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: repo.primaryLanguage.color }} />
                        {repo.primaryLanguage.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Star size={11} /> {repo.stargazerCount}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(repo.pushedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Collaborators — click to open modal */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-indigo-500" />
            <h2 className="text-lg font-semibold">Collaborator Details</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">Click any collaborator to see shared repos and their PRs.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {collaborators.map((collab) => (
              <button
                key={collab.login}
                onClick={() => setSelectedCollaborator(collab as Collaborator)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-colors text-left w-full"
              >
                <img src={collab.avatarUrl} alt={collab.login} className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{collab.name || collab.login}</p>
                  <p className="text-xs text-slate-500">
                    {collab.count} commits • {collab.repos.length} repos
                    {collab.prs.length > 0 && ` • ${collab.prs.length} PRs`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <footer className="text-center text-slate-400 text-sm py-8 flex items-center justify-center gap-2">
          <Info size={14} /> Built with React, Tailwind & GitHub GraphQL API
        </footer>
      </div>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 min-w-fit">
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
