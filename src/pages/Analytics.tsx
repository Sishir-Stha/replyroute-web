import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import {
  getDashboardSummary,
  getInquiriesByChannel,
  getInquiriesByDepartment,
  getResponseStatus,
  getTeamPerformance,
  getWeeklyVolume,
} from '@/services/analyticsService';
import type {
  BackendChartPointDto,
  BackendDashboardSummaryDto,
  BackendTeamPerformanceDto,
} from '@/lib/mappers';

const COLORS = ['#0ea5e9', '#14b8a6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316', '#ec4899', '#6366f1'];

function getScopeTitle(user: ReturnType<typeof useAuth>['user']) {
  if (!user || user.role === 'SUPER_ADMIN') return 'Company Analytics';
  return `${user.department} Department Analytics`;
}

export default function Analytics() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<BackendDashboardSummaryDto | null>(null);
  const [channelChartData, setChannelChartData] = useState<BackendChartPointDto[]>([]);
  const [departmentData, setDepartmentData] = useState<BackendChartPointDto[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<BackendChartPointDto[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<BackendChartPointDto[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<BackendTeamPerformanceDto[]>([]);
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
      getTeamPerformance(),
    ])
      .then(([dashboard, channels, departments, weekly, responseStatus, team]) => {
        if (cancelled) return;
        setSummary(dashboard);
        setChannelChartData(channels);
        setDepartmentData(departments);
        setMonthlyTrendData(weekly);
        setStatusBreakdown(responseStatus);
        setTeamPerformance(team);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError instanceof Error ? requestError.message : 'Unable to load analytics.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const resolutionRate = summary?.totalInquiries
    ? Math.round((summary.resolved / summary.totalInquiries) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getScopeTitle(user)}</h1>
        <p className="text-sm text-gray-500">Operational insights returned by backend permissions</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Visible Inquiries', value: summary?.totalInquiries ?? 0, sub: summary?.scope ?? 'current scope' },
          { label: 'Pending Messages', value: summary?.pendingMessages ?? 0, sub: 'requires response' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, sub: `${summary?.resolved ?? 0} resolved` },
          { label: 'High Priority', value: summary?.highPriority ?? 0, sub: 'high or urgent' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
            <p className="mt-1 text-[11px] text-ocean-600">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Message Volume Trend</h3>
          {monthlyTrendData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No trend data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrendData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Inquiries by Department</h3>
          {departmentData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No department data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={departmentData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#14b8a6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Channel-wise Inquiry Count</h3>
          {channelChartData.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No channel data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={channelChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false}>
                  {channelChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Response Status</h3>
          {statusBreakdown.length === 0 ? (
            <p className="py-20 text-center text-sm text-gray-400">{loading ? 'Loading chart...' : 'No status data yet.'}</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusBreakdown}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Team Performance</h3>
        {teamPerformance.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">{loading ? 'Loading team data...' : 'No team performance data yet.'}</p>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>{['Name', 'Department', 'Role', 'Active', 'Resolved Today', 'Avg Response'].map((header) => (
                <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">{header}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teamPerformance.slice(0, 8).map((member) => (
                <tr key={`${member.name}-${member.department}`} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{member.department}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{member.role}</td>
                  <td className="px-3 py-2 text-sm font-medium">{member.active}</td>
                  <td className="px-3 py-2 text-sm font-medium text-green-600">{member.resolvedToday}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{member.avgResponse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
