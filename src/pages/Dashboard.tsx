import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Flame, Inbox, UserX } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import { getViewingLabel } from '@/lib/inquiryAccess';
import {
  getDashboardSummary,
  getInquiriesByChannel,
  getInquiriesByDepartment,
  getResponseStatus,
  getWeeklyVolume,
} from '@/services/analyticsService';
import type { BackendChartPointDto, BackendDashboardSummaryDto } from '@/lib/mappers';

const COLORS = ['#0ea5e9', '#f472b6', '#22c55e', '#14b8a6', '#f97316', '#8b5cf6', '#ef4444', '#64748b'];

type DashboardState = {
  summary: BackendDashboardSummaryDto | null;
  channelChartData: BackendChartPointDto[];
  departmentChartData: BackendChartPointDto[];
  responseStatusData: BackendChartPointDto[];
  weeklyVolumeData: Array<{ name: string; inquiries: number; resolved: number }>;
};

function getOverviewTitle(user: ReturnType<typeof useAuth>['user']) {
  if (!user || user.role === 'SUPER_ADMIN') return 'Company Overview';
  if (user.role === 'DEPARTMENT_HEAD') return `${user.department} Department Overview`;

  return `${user.department} Inbox Overview`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardState>({
    summary: null,
    channelChartData: [],
    departmentChartData: [],
    responseStatusData: [],
    weeklyVolumeData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');
    Promise.all([
      getDashboardSummary(),
      getInquiriesByChannel(),
      getInquiriesByDepartment(),
      getWeeklyVolume(),
      getResponseStatus(),
    ])
      .then(([summary, channels, departments, weekly, responseStatus]) => {
        if (cancelled) return;
        setData({
          summary,
          channelChartData: channels,
          departmentChartData: departments,
          responseStatusData: responseStatus,
          weeklyVolumeData: weekly.map((item) => ({
            name: item.name,
            inquiries: item.value,
            resolved: 0,
          })),
        });
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard metrics.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const scopeTitle = user?.department === 'All' ? 'Company' : user?.department ?? 'Department';
  const summary = data.summary;
  const stats = [
    { title: `${scopeTitle} Inquiries Today`, value: summary?.totalInquiries ?? 0, icon: <Inbox size={20} />, change: 12 },
    { title: `${scopeTitle} Pending Messages`, value: summary?.pendingMessages ?? 0, icon: <UserX size={20} />, change: -8 },
    { title: `${scopeTitle} Resolved Today`, value: summary?.resolved ?? 0, icon: <CheckCircle2 size={20} />, change: 18 },
    { title: `${scopeTitle} High Priority`, value: summary?.highPriority ?? 0, icon: <Flame size={20} />, change: -3 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getOverviewTitle(user)}</h1>
        <p className="text-sm text-gray-500">{getViewingLabel(user)}. Metrics are filtered by backend permissions.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={loading ? '...' : stat.value} icon={stat.icon} change={stat.change} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Inquiries by Channel</h3>
          {data.channelChartData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No channel data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.channelChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" labelLine={false}>
                  {data.channelChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Inquiries by Assigned Department</h3>
          {data.departmentChartData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No department data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.departmentChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Weekly Message Volume</h3>
          {data.weeklyVolumeData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No weekly volume data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.weeklyVolumeData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="inquiries" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Response Status Breakdown</h3>
          {data.responseStatusData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No response status data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.responseStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false}>
                  {data.responseStatusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
