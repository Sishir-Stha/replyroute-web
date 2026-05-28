import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useInquiries } from '@/context/InquiryContext';
import { getVisibleInquiries } from '@/lib/inquiryAccess';
import { departments } from '@/lib/routingEngine';
import { getTeamMembers } from '@/lib/teamStore';
import type { Channel, Inquiry, InquiryStatus } from '@/types';

const COLORS = ['#0ea5e9', '#14b8a6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#f97316', '#ec4899', '#6366f1'];
const channelLabels: Record<Channel, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  website: 'Website',
  email: 'Email',
};
const statusOrder: InquiryStatus[] = ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

function isSameMonth(inquiry: Inquiry, monthIndex: number) {
  return new Date(inquiry.createdAt).getMonth() === monthIndex;
}

function countChannels(inquiries: Inquiry[]) {
  return Object.entries(channelLabels).map(([channel, name]) => ({
    name,
    value: inquiries.filter((inquiry) => inquiry.channel === channel).length,
  })).filter((item) => item.value > 0);
}

function countDepartments(inquiries: Inquiry[]) {
  return departments.map((department) => ({
    name: department,
    time: Math.max(0.5, inquiries.filter((inquiry) => inquiry.assignedDepartment === department).length * 0.5 + 0.75),
  })).filter((item) => inquiries.some((inquiry) => inquiry.assignedDepartment === item.name));
}

function countCategories(inquiries: Inquiry[]) {
  return Object.entries(inquiries.reduce<Record<string, number>>((acc, inquiry) => {
    acc[inquiry.category] = (acc[inquiry.category] ?? 0) + 1;
    return acc;
  }, {})).map(([name, count]) => ({ name, count }));
}

function volumeTrend(inquiries: Inquiry[]) {
  return months.map((name, index) => ({
    name,
    volume: inquiries.filter((inquiry) => isSameMonth(inquiry, index)).length,
  }));
}

function getScopeTitle(user: ReturnType<typeof useAuth>['user']) {
  if (!user || user.role === 'SUPER_ADMIN') return 'Company Analytics';
  return `${user.department} Department Analytics`;
}

export default function Analytics() {
  const { user } = useAuth();
  const { inquiries } = useInquiries();
  const visibleInquiries = getVisibleInquiries(inquiries, user);
  const teamMembers = getTeamMembers();
  const visibleTeam = user?.role === 'SUPER_ADMIN'
    ? teamMembers
    : teamMembers.filter((member) => member.department === user?.department);
  const resolved = visibleInquiries.filter((inquiry) => inquiry.status === 'Resolved').length;
  const overdue = visibleInquiries.filter((inquiry) => inquiry.isOverdue).length;
  const resolutionRate = visibleInquiries.length ? Math.round((resolved / visibleInquiries.length) * 100) : 0;
  const channelChartData = countChannels(visibleInquiries);
  const deptResponseTimeData = countDepartments(visibleInquiries);
  const topCategoriesData = countCategories(visibleInquiries);
  const monthlyTrendData = volumeTrend(visibleInquiries);
  const statusBreakdown = statusOrder.map((status) => ({
    status,
    count: visibleInquiries.filter((inquiry) => inquiry.status === status).length,
  })).filter((item) => item.count > 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getScopeTitle(user)}</h1>
        <p className="text-sm text-gray-500">Operational insights filtered to the current role and department</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Visible Inquiries', value: visibleInquiries.length, sub: user?.role === 'SUPER_ADMIN' ? 'all departments' : user?.department ?? 'department' },
          { label: 'Avg First Response', value: visibleInquiries.length > 4 ? '1h 42m' : '2h 10m', sub: 'mock response metric' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, sub: `${resolved} resolved` },
          { label: 'Overdue Messages', value: overdue, sub: `${visibleInquiries.filter((inquiry) => inquiry.status === 'Escalated').length} escalated` },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-1 text-[11px] text-ocean-600">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Message Volume Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrendData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="volume" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Avg Response Time by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptResponseTimeData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="time" fill="#14b8a6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Channel-wise Inquiry Count</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={channelChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false}>
                {channelChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Inquiry Categories</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topCategoriesData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Status Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statusBreakdown.map((item) => (
            <div key={item.status} className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{item.count}</p>
              <p className="text-xs text-gray-500">{item.status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Team Performance</h3>
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>{['Name', 'Department', 'Role', 'Active', 'Resolved Today', 'Avg Response'].map((header) => (
              <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">{header}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visibleTeam.slice(0, 8).map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{member.department}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{member.role}</td>
                <td className="px-3 py-2 text-sm font-medium">{member.activeTickets}</td>
                <td className="px-3 py-2 text-sm font-medium text-green-600">{member.resolvedToday}</td>
                <td className="px-3 py-2 text-sm text-gray-600">{member.avgResponseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
