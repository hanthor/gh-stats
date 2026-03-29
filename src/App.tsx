import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { 
  Github, GitPullRequest, IssueOpened, Star, GitFork, Users, Calendar, 
  ExternalLink, Info
} from 'lucide-react';
import statsData from './data/stats.json';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function App() {
  const { user, yearlyStats, topRepos, collaborators, updatedAt } = statsData;

  const totalCommits = useMemo(() => 
    yearlyStats.reduce((acc, curr) => acc + curr.commits, 0), 
  [yearlyStats]);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full ring-2 ring-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}'s GitHub Stats</h1>
            <p className="text-slate-500 flex items-center gap-1">
              <Github size={16} /> @hanthor • Last updated: {new Date(updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 overflow-x-auto">
          <StatCard icon={<Star className="text-yellow-500" />} label="Repos" value={user.totalRepos} />
          <StatCard icon={<GitPullRequest className="text-green-500" />} label="PRs" value={user.totalPRs} />
          <StatCard icon={<IssueOpened className="text-red-500" />} label="Issues" value={user.totalIssues} />
          <StatCard icon={<Calendar className="text-indigo-500" />} label="All-time Commits" value={totalCommits} />
        </div>
      </header>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contributions Over Time */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-indigo-500" />
            <h2 className="text-lg font-semibold">Contributions Over Time</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="commits" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="prs" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Collaborators & Co-Authors */}
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
                  cursor={{fill: '#f8fafc'}}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Repositories */}
        <section className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Star className="text-yellow-500" />
            <h2 className="text-lg font-semibold">Top Repositories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRepos.map((repo) => (
              <div key={repo.name} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-colors">
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
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.primaryLanguage.color }}></span>
                    <span className="text-slate-600">{repo.primaryLanguage.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Collaborator List Card */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-6">
            <Users className="text-indigo-500" />
            <h2 className="text-lg font-semibold">Collaborator Details</h2>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {collaborators.map((collab) => (
              <div key={collab.login} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <img src={collab.avatarUrl} alt={collab.login} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800">{collab.name || collab.login}</p>
                  <p className="text-xs text-slate-500">{collab.count} co-authored commits</p>
                </div>
                <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                  {collab.repos.length} Repos
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="text-center text-slate-400 text-sm py-8 flex items-center justify-center gap-2">
        <Info size={14} /> Built with React, Tailwind & GitHub GraphQL API
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
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
