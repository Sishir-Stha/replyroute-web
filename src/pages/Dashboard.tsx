import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Flame, Inbox, UserX } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useInquiries } from '@/context/InquiryContext';
import { getVisibleInquiries, getViewingLabel } from '@/lib/inquiryAccess';
import { departments } from '@/lib/routingEngine';
import type { Channel, Inquiry, InquiryStatus } from '@/types';

const COLORS = ['#0ea5e9', '#f472b6', '#22c55e', '#14b8a6', '#f97316', '#8b5cf6', '#ef4444', '#64748b'];
const channelLabels: Record<Channel, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  website: 'Website',
  email: 'Email',
};
const statusOrder: InquiryStatus[] = ['Resolved', 'In Progress', 'Pending', 'New', 'Assigned', 'Escalated'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isToday(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();

  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function countByChannel(inquiries: Inquiry[]) {
  return Object.entries(channelLabels).map(([channel, name]) => ({
    name,
    value: inquiries.filter((inquiry) => inquiry.channel === channel).length,
  })).filter((item) => item.value > 0);
}

function countByDepartment(inquiries: Inquiry[]) {
  return departments.map((department) => ({
    name: department,
    value: inquiries.filter((inquiry) => inquiry.assignedDepartment === department).length,
  })).filter((item) => item.value > 0);
}

function countByStatus(inquiries: Inquiry[]) {
  return statusOrder.map((status) => ({
    name: status,
    value: inquiries.filter((inquiry) => inquiry.status === status).length,
  })).filter((item) => item.value > 0);
}

function getWeeklyVolume(inquiries: Inquiry[]) {
  return weekDays.map((name, index) => ({
    name,
    inquiries: inquiries.filter((inquiry) => new Date(inquiry.createdAt).getDay() === index).length,
    resolved: inquiries.filter((inquiry) => (
      new Date(inquiry.createdAt).getDay() === index && inquiry.status === 'Resolved'
    )).length,
  }));
}

function getOverviewTitle(user: ReturnType<typeof useAuth>['user']) {
  if (!user || user.role === 'SUPER_ADMIN') return 'Company Overview';
  if (user.role === 'DEPARTMENT_HEAD') return `${user.department} Department Overview`;

  return `${user.department} Inbox Overview`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { inquiries } = useInquiries();
  const visibleInquiries = getVisibleInquiries(inquiries, user);
  const scopeTitle = user?.department === 'All' ? 'Company' : user?.department ?? 'Department';
  const todayInquiries = visibleInquiries.filter((inquiry) => isToday(inquiry.createdAt));
  const pendingInquiries = visibleInquiries.filter((inquiry) => inquiry.status !== 'Resolved');
  const resolvedToday = visibleInquiries.filter((inquiry) => inquiry.status === 'Resolved' && isToday(inquiry.createdAt));
  const channelChartData = countByChannel(visibleInquiries);
  const departmentChartData = countByDepartment(visibleInquiries);
  const responseStatusData = countByStatus(visibleInquiries);
  const weeklyVolumeData = getWeeklyVolume(visibleInquiries);

  const stats = [
    { title: `${scopeTitle} Inquiries Today`, value: todayInquiries.length, icon: <Inbox size={20} />, change: 12 },
    { title: `${scopeTitle} Pending Messages`, value: pendingInquiries.length, icon: <UserX size={20} />, change: -8 },
    { title: `${scopeTitle} Resolved Today`, value: resolvedToday.length, icon: <CheckCircle2 size={20} />, change: 18 },
    { title: `${scopeTitle} High Priority`, value: visibleInquiries.filter((inquiry) => inquiry.priority === 'High' || inquiry.priority === 'Urgent').length, icon: <Flame size={20} />, change: -3 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{getOverviewTitle(user)}</h1>
        <p className="text-sm text-gray-500">{getViewingLabel(user)}. Metrics are filtered to this role.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} change={stat.change} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Inquiries by Channel</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={channelChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" labelLine={false}>
                {channelChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Inquiries by Assigned Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={departmentChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Weekly Message Volume</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyVolumeData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="inquiries" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Response Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={responseStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false}>
                {responseStatusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
