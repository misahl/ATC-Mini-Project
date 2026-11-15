import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  GitBranch,
  Zap,
  Layers,
  ShieldCheck,
  Terminal,
  BookOpen,
  Minimize2,
  Camera,
  Settings,
  SunMedium,
  Sun,
  Moon,
} from 'lucide-react';

export type NavItem =
  | 'nfa-to-dfa'
  | 'enfa-to-dfa'
  | 'enfa-to-nfa'
  | 'dfa-to-nfa'
  | 'minimization'
  | 'simulator'
  | 'validator'
  | 'learn';

export type AppTheme = 'slate' | 'light' | 'midnight';

interface NavbarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenScanner,
  onOpenSettings,
}) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('automata-theme') as AppTheme;
    return saved === 'light' || saved === 'midnight' ? saved : 'slate';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('automata-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'slate') return 'light';
      if (prev === 'light') return 'midnight';
      return 'slate';
    });
  };

  const tabs: Array<{ id: NavItem; label: string; icon: React.ReactNode }> = [
    { id: 'nfa-to-dfa', label: 'NFA → DFA', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'enfa-to-dfa', label: 'ε-NFA → DFA', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'enfa-to-nfa', label: 'ε-NFA → NFA', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'dfa-to-nfa', label: 'DFA → NFA', icon: <GitCommit className="w-3.5 h-3.5" /> },
    { id: 'minimization', label: 'DFA Minimizer', icon: <Minimize2 className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'String Tester', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'validator', label: 'Validator', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'learn', label: 'Theory Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="border-b border-slate-700/60 bg-[#1e2838] text-slate-200 sticky top-0 z-40 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded bg-indigo-900/60 border border-indigo-600/60 flex items-center justify-center font-mono font-bold text-xs text-indigo-300">
            δ
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
              <span>Automata Solver</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/70">
                v2.1
              </span>
            </div>
          </div>
        </div>

        {/* Tab navigation: Clean engineering segment control */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {tabs.map(t => {
            const active = currentTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors font-mono ${
                  active
                    ? 'bg-slate-750 bg-[#2b374a] text-white border border-slate-600/80 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 text-xs font-mono"
            title={`Current Theme: ${
              theme === 'slate' ? 'Lighter Slate' : theme === 'light' ? 'Daylight Light' : 'Midnight Dark'
            } (Click to switch)`}
          >
            {theme === 'slate' && <SunMedium className="w-3.5 h-3.5 text-amber-400" />}
            {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
            {theme === 'midnight' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden md:inline capitalize text-[11px]">
              {theme === 'slate' ? 'Lighter' : theme === 'light' ? 'Light' : 'Midnight'}
            </span>
          </button>

          {/* Prominent Scan Question button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-xs transition-colors"
            title="Scan question using live camera or photo upload"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SCAN QUESTION</span>
            <span className="sm:hidden">SCAN</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700"
            title="AI Vision API Key Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Mobile dropdown selector */}
          <div className="lg:hidden ml-1">
            <select
              value={currentTab}
              onChange={e => onTabChange(e.target.value as NavItem)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 font-mono focus:outline-none"
            >
              {tabs.map(t => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
