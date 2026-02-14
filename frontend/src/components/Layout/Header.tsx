import { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { notificationsApi } from '../../api/client';
import { Notification } from '../../types';

export default function Header() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    notificationsApi.list().then(setNotifications).catch(() => {});
  }, []);

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients, policies, claims..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-lockton-navy focus:ring-1 focus:ring-lockton-navy outline-none bg-gray-50"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-3 border-b font-semibold text-sm">Notifications ({notifications.length})</div>
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${priorityColors[n.priority] || 'bg-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-lockton-navy rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
