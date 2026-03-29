import { useEffect } from 'react';
import { X, GitPullRequest, GitMerge, CircleDot, ExternalLink, GitFork } from 'lucide-react';

type PR = {
  number: number;
  title: string;
  state: string;
  url: string;
  repoName: string;
  createdAt: string;
};

type Repo = {
  name: string;
  commits: number;
};

export type Collaborator = {
  login: string;
  name: string;
  avatarUrl: string;
  count: number;
  repos: Repo[];
  prs: PR[];
};

type Props = {
  collaborator: Collaborator;
  ownerLogin: string;
  onClose: () => void;
};

function PRStateBadge({ state }: { state: string }) {
  if (state === 'MERGED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex-shrink-0">
        <GitMerge size={11} /> Merged
      </span>
    );
  }
  if (state === 'OPEN') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
        <CircleDot size={11} /> Open
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 flex-shrink-0">
      <CircleDot size={11} /> Closed
    </span>
  );
}

export default function CollaboratorModal({ collaborator, ownerLogin, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const sortedRepos = [...collaborator.repos].sort((a, b) => b.commits - a.commits);
  const sortedPRs = [...collaborator.prs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-100">
          <a href={`https://github.com/${collaborator.login}`} target="_blank" rel="noopener noreferrer">
            <img
              src={collaborator.avatarUrl}
              alt={collaborator.login}
              className="w-14 h-14 rounded-full ring-2 ring-indigo-400"
            />
          </a>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{collaborator.name || collaborator.login}</h2>
            <a
              href={`https://github.com/${collaborator.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              @{collaborator.login} <ExternalLink size={12} />
            </a>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Shared repos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GitFork size={14} /> Repos worked on together
            </h3>
            {sortedRepos.length === 0 ? (
              <p className="text-sm text-slate-400">No shared repos found.</p>
            ) : (
              <div className="space-y-2">
                {sortedRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={`https://github.com/${ownerLogin}/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-800">{repo.name}</span>
                    <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {repo.commits} commits
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Pull Requests */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GitPullRequest size={14} /> Pull requests in your repos
            </h3>
            {sortedPRs.length === 0 ? (
              <p className="text-sm text-slate-400">No PRs found.</p>
            ) : (
              <div className="space-y-2">
                {sortedPRs.map((pr) => (
                  <a
                    key={`${pr.repoName}-${pr.number}`}
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 leading-snug">{pr.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {pr.repoName} #{pr.number} •{' '}
                        {new Date(pr.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <PRStateBadge state={pr.state} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
