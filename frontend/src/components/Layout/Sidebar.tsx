import { NavLink } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  LayoutDashboard, Users, FileText, AlertTriangle, Building2,
  RefreshCcw, Award, BarChart3, FolderOpen, GitBranch,
  MessageSquare, Settings, LogOut, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useState } from 'react';
import { classNames } from '../../utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'broker', 'client', 'analyst'] },
  { to: '/clients', icon: Users, label: 'Clients', roles: ['admin', 'broker', 'analyst'] },
  { to: '/policies', icon: FileText, label: 'Policies', roles: ['admin', 'broker', 'client', 'analyst'] },
  { to: '/claims', icon: AlertTriangle, label: 'Claims', roles: ['admin', 'broker', 'client', 'analyst'] },
  { to: '/renewals', icon: RefreshCcw, label: 'Renewals', roles: ['admin', 'broker'] },
  { to: '/carriers', icon: Building2, label: 'Carriers', roles: ['admin', 'broker'] },
  { to: '/certificates', icon: Award, label: 'Certificates', roles: ['admin', 'broker', 'client'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'broker', 'analyst'] },
  { to: '/documents', icon: FolderOpen, label: 'Documents', roles: ['admin', 'broker', 'client'] },
  { to: '/workflows', icon: GitBranch, label: 'Workflows', roles: ['admin', 'broker'] },
  { to: '/ai', icon: MessageSquare, label: 'AI Assistant', roles: ['admin', 'broker', 'analyst'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const role = user?.role || 'client';

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className={classNames(
      'flex flex-col bg-lockton-navy-dark text-white transition-all duration-300 h-screen sticky top-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-lockton-gold rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-lockton-navy-dark" />
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-wide">INSURANCE PLATFORM</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-lockton-gold/20 text-lockton-gold'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-lockton-gold/20 rounded-full flex items-center justify-center text-lockton-gold text-sm font-bold">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className={classNames(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors',
              collapsed ? 'justify-center w-full' : 'flex-1'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
