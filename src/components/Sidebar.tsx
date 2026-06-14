import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Settings as SettingsIcon, ShieldAlert, MessageSquareCode, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Training', icon: GraduationCap, path: '/training' },
    { name: 'History (Learning)', icon: Clock, path: '/history' },
    { name: 'Blocked Phrases', icon: ShieldAlert, path: '/blocked' },
    { name: 'AI Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-card border-r flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <MessageSquareCode className="text-primary-foreground h-6 w-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">BidBot</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Public Access</p>
            <p className="text-xs text-muted-foreground truncate">No login required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
