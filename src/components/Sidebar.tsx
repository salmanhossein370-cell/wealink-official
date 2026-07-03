import React from 'react';
import { 
  Wallet, 
  Send, 
  Users, 
  History, 
  Settings, 
  Globe, 
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  language: 'it' | 'en';
  setLanguage: (lang: 'it' | 'en') => void;
  user: {
    name: string;
    email: string;
    avatar: string;
    color: string;
  };
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  user,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {

  const menuItems = [
    { 
      id: 'dashboard' as ViewType, 
      label: language === 'it' ? 'Panoramica' : 'Dashboard', 
      icon: Wallet 
    },
    { 
      id: 'send' as ViewType, 
      label: language === 'it' ? 'Invia Denaro' : 'Send Money', 
      icon: Send 
    },
    { 
      id: 'wallet' as ViewType, 
      label: language === 'it' ? 'Portafoglio' : 'My Wallet', 
      icon: Wallet 
    },
    { 
      id: 'contacts' as ViewType, 
      label: language === 'it' ? 'Contatti' : 'Contacts', 
      icon: Users 
    },
    { 
      id: 'activity' as ViewType, 
      label: language === 'it' ? 'Attività' : 'Activity History', 
      icon: History 
    },
  ];

  const handleNavClick = (view: ViewType) => {
    setCurrentView(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-slate-100 bg-white flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100">
            W
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">
            Wea<span className="text-indigo-600">link</span>
          </span>
        </div>
        
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          id="mobile-menu-toggle"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between
        transform lg:transform-none transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:sticky lg:h-screen lg:top-0
      `}>
        {/* Brand & Logo */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/20">
                W
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Wea<span className="text-indigo-400">link</span>
              </span>
            </div>
            
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                      : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with Language and Profile */}
        <div className="p-4 border-t border-slate-800/60 space-y-4 bg-slate-950/40">
          {/* Language Selector */}
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Globe className="h-3.5 w-3.5" />
              {language === 'it' ? 'Lingua' : 'Language'}
            </span>
            <div className="bg-slate-800 p-0.5 rounded-lg flex">
              <button
                onClick={() => setLanguage('it')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'it' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                IT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  language === 'en' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl border border-slate-800/50">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-bold`}>
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
