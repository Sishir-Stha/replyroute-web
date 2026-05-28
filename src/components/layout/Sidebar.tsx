import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, GitBranch, Building2, Users, BarChart3,
  Plug, FileText, Settings, ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllowedNavItems } from '@/lib/permissions';
import type { AppRoutePath } from '@/lib/permissions';

const iconMap: Record<AppRoutePath, ComponentType<{ size?: number; className?: string }>> = {
  '/dashboard': LayoutDashboard,
  '/inbox': Inbox,
  '/routing-rules': GitBranch,
  '/departments': Building2,
  '/team': Users,
  '/analytics': BarChart3,
  '/integrations': Plug,
  '/form-builder': FileText,
  '/settings': Settings,
};

type SidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const { user } = useAuth();
  const navItems = getAllowedNavItems(user);

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-800 bg-[#0f172a] text-gray-300 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="absolute -right-3 top-5 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition-colors hover:bg-ocean-50 hover:text-ocean-700"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-800 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-500 to-teal-500">
          <MessageSquare size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-white tracking-tight">ReplyRoute</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const Icon = iconMap[item.to];

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ocean-500/15 text-ocean-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span className="flex-1">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
