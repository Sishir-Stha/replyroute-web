import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { demoUsers, useAuth } from '@/context/AuthContext';
import { getRoleLabel } from '@/lib/permissions';

const features = [
  'Collect messages from Facebook, Instagram, WhatsApp, Website, and Email',
  'Auto-route each inquiry to the right department',
  'Filter every inbox by role and department',
  'Track routing decisions, SLA risk, and follow-up ownership',
];

const demoUserGroups = [
  {
    title: 'Super Admin',
    users: demoUsers.filter((user) => user.role === 'SUPER_ADMIN'),
  },
  {
    title: 'Department Heads',
    users: demoUsers.filter((user) => user.role === 'DEPARTMENT_HEAD'),
  },
  {
    title: 'Social Media Handlers',
    users: demoUsers.filter((user) => user.role === 'SOCIAL_MEDIA_HANDLER'),
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@replyroute.com');
  const [password, setPassword] = useState('demo123');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const result = await login(email, password);

    if (!result.success) {
      setError(result.message ?? 'Unable to sign in.');
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  const selectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-gradient-to-br from-[#0f172a] via-[#0c4a6e] to-[#134e4a] p-12 text-white">
        <div className="mx-auto max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <MessageSquare size={28} className="text-teal-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ReplyRoute</h1>
              <p className="text-sm text-teal-200/80">Role-based inquiry routing prototype</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold leading-tight">Every message.<br />Right team. Fast.</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              ReplyRoute detects message intent, routes it to the responsible department, and keeps each role focused on its own inbox.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-teal-400" />
                <span className="text-sm text-gray-200">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-500 to-teal-500">
              <MessageSquare size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ReplyRoute</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to demo workspace</h2>
            <p className="mt-1 text-sm text-gray-500">Use a listed demo email with password demo123.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@replyroute.com"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="demo123"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="rounded border-gray-300 accent-ocean-500"
                />
                Remember me
              </label>
              <span className="text-sm font-medium text-ocean-600">API login</span>
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Checking session...' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Demo credentials</p>
            <div className="space-y-4">
              {demoUserGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{group.title}</p>
                  <div className="grid gap-2">
                    {group.users.map((demoUser) => (
                      <button
                        key={demoUser.id}
                        type="button"
                        onClick={() => selectDemoUser(demoUser.email)}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left transition-colors hover:border-ocean-200 hover:bg-ocean-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{demoUser.email} / demo123</p>
                          <p className="text-[11px] text-gray-500">
                            {getRoleLabel(demoUser)} - {demoUser.department}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
