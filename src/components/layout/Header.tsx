import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleLabel } from '@/lib/permissions';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md md:px-6">
      {/* Search */}
      <div className="relative hidden w-full max-w-80 sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search inquiries, customers..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-all"
        />
      </div>

      {/* Right section */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ocean-500 to-teal-500 text-xs font-bold text-white">
            {user?.name.split(' ').map((part) => part[0]).join('') ?? 'RR'}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
            <p className="text-[11px] text-gray-500">
              {getRoleLabel(user)} - {user?.department}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
        >
          <LogOut size={14} />
          Logout
        </button>

        <div className="flex items-center gap-2 rounded-lg p-1 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ocean-500 to-teal-500 text-xs font-bold text-white">
            {user?.name.split(' ').map((part) => part[0]).join('') ?? 'RR'}
          </div>
        </div>
      </div>
    </header>
  );
}
