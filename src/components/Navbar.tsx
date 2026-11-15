import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
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
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export type NavItem =
  | 'home'
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('automata-theme', theme);
  }, [theme]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'slate') return 'light';
      if (prev === 'light') return 'midnight';
      return 'slate';
    });
  };

  const handleSelectTab = (tab: NavItem) => {
    onTabChange(tab);
    setIsDrawerOpen(false);
  };

  const desktopTabs: Array<{ id: NavItem; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'nfa-to-dfa', label: 'NFA → DFA', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'enfa-to-dfa', label: 'ε-NFA → DFA', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'enfa-to-nfa', label: 'ε-NFA → NFA', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'dfa-to-nfa', label: 'DFA → NFA', icon: <GitCommit className="w-3.5 h-3.5" /> },
    { id: 'minimization', label: 'Minimizer', icon: <Minimize2 className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'String Tester', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'validator', label: 'Validator', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'learn', label: 'Theory Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const solverItems: Array<{ id: NavItem; title: string; subtitle: string; icon: React.ReactNode }> = [
    { id: 'nfa-to-dfa', title: 'NFA to DFA', subtitle: 'Rabin-Scott subset construction', icon: <GitBranch className="w-4 h-4 text-cyan-400" /> },
    { id: 'enfa-to-dfa', title: 'ε-NFA to DFA', subtitle: 'ε-closure + subset derivation', icon: <Zap className="w-4 h-4 text-purple-400" /> },
    { id: 'enfa-to-nfa', title: 'ε-NFA to NFA', subtitle: 'Epsilon elimination', icon: <Layers className="w-4 h-4 text-pink-400" /> },
    { id: 'dfa-to-nfa', title: 'DFA to NFA', subtitle: 'Singleton inclusion proof', icon: <GitCommit className="w-4 h-4 text-indigo-400" /> },
    { id: 'minimization', title: 'DFA Minimizer', subtitle: 'Table-filling Myhill-Nerode', icon: <Minimize2 className="w-4 h-4 text-emerald-400" /> },
  ];

  const toolItems: Array<{ id: NavItem; title: string; subtitle: string; icon: React.ReactNode }> = [
    { id: 'simulator', title: 'String Acceptance Tester', subtitle: 'Step-by-step tape tracer', icon: <Terminal className="w-4 h-4 text-cyan-400" /> },
    { id: 'validator', title: 'Automata Validator', subtitle: '5-tuple & reachability checker', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { id: 'learn', title: 'Curriculum Notes & Quiz', subtitle: 'Exam preparation guide', icon: <BookOpen className="w-4 h-4 text-purple-400" /> },
  ];

  // Determine active category for mobile bottom bar
  const isSolverActive = ['nfa-to-dfa', 'enfa-to-dfa', 'enfa-to-nfa', 'dfa-to-nfa', 'minimization'].includes(currentTab);

  return (
    <>
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-[#1e2838] text-slate-200 sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div
            onClick={() => handleSelectTab('home')}
            className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-600/60 flex items-center justify-center font-mono font-bold text-sm text-indigo-300 group-hover:border-indigo-400 transition-colors">
              δ
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                <span>Automata Solver</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/70 hidden xs:inline">
                  v2.2
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {desktopTabs.map(t => {
              const active = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTab(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors font-mono whitespace-nowrap min-h-[36px] ${
                    active
                      ? 'bg-[#2b374a] text-white border border-slate-600/80 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme switcher */}
            <button
              onClick={cycleTheme}
              className="flex items-center justify-center min-w-[38px] min-h-[38px] p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 text-xs font-mono"
              title={`Current Theme: ${
                theme === 'slate' ? 'Lighter Slate' : theme === 'light' ? 'Daylight Light' : 'Midnight Dark'
              } (Tap to cycle)`}
              aria-label="Toggle visual theme"
            >
              {theme === 'slate' && <SunMedium className="w-4 h-4 text-amber-400" />}
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'midnight' && <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Desktop Scan Question Button */}
            <button
              onClick={onOpenScanner}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-mono text-xs font-semibold shadow-xs transition-all min-h-[38px]"
              title="Scan question using live camera or photo upload"
            >
              <Camera className="w-4 h-4" />
              <span>SCAN QUESTION</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center min-w-[38px] min-h-[38px] p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700"
              title="AI Vision API Key Settings"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger Button (< 1024px) */}
            <button
              onClick={() => setIsDrawerOpen(prev => !prev)}
              className="lg:hidden flex items-center justify-center min-w-[42px] min-h-[42px] p-2 rounded-lg bg-[#2b374a] text-slate-200 hover:text-white border border-slate-600/80 active:bg-slate-700 transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {isDrawerOpen ? <X className="w-5 h-5 text-indigo-300" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Slide-out Sheet */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#1e2838] border-l border-slate-700/80 h-full flex flex-col shadow-2xl z-10 overflow-y-auto touch-scroll">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-700/60 flex items-center justify-between sticky top-0 bg-[#1e2838] z-20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-indigo-900/60 border border-indigo-600/60 flex items-center justify-center font-mono font-bold text-xs text-indigo-300">
                  δ
                </div>
                <span className="font-semibold text-sm text-white font-mono">Navigation Menu</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-6 flex-1 pb-24">
              {/* Scan Button inside Drawer */}
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenScanner();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition-all min-h-[48px]"
              >
                <Camera className="w-5 h-5" />
                <span>SCAN QUESTION WITH CAMERA</span>
              </button>

              {/* Home */}
              <div>
                <button
                  onClick={() => handleSelectTab('home')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-mono transition-colors min-h-[46px] ${
                    currentTab === 'home'
                      ? 'bg-indigo-950/70 border-indigo-600/80 text-white'
                      : 'bg-[#222d3d] border-slate-700/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-sm font-semibold">Home Dashboard</div>
                      <div className="text-[11px] text-slate-400">Main overview & quick tools</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Conversion Solvers */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold px-1">
                  Automata Solvers
                </div>
                <div className="space-y-1.5">
                  {solverItems.map(item => {
                    const active = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-mono transition-colors min-h-[48px] ${
                          active
                            ? 'bg-indigo-950/70 border-indigo-600/80 text-white shadow-xs'
                            : 'bg-[#222d3d] border-slate-700/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-slate-800/80">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{item.title}</div>
                            <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diagnostics & Study Suite */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-1">
                  Diagnostics & Notes
                </div>
                <div className="space-y-1.5">
                  {toolItems.map(item => {
                    const active = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left font-mono transition-colors min-h-[48px] ${
                          active
                            ? 'bg-indigo-950/70 border-indigo-600/80 text-white shadow-xs'
                            : 'bg-[#222d3d] border-slate-700/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-slate-800/80">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{item.title}</div>
                            <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Fixed for quick thumb access) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#1e2838]/95 backdrop-blur-md border-t border-slate-700/70 bottom-nav-safe lg:hidden shadow-2xl"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          {/* 1. Dashboard / Home */}
          <button
            onClick={() => handleSelectTab('home')}
            className={`flex flex-col items-center justify-center h-full w-full py-1 text-[10px] font-mono transition-colors ${
              currentTab === 'home' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          {/* 2. Solve Tab */}
          <button
            onClick={() => handleSelectTab(isSolverActive ? currentTab : 'nfa-to-dfa')}
            className={`flex flex-col items-center justify-center h-full w-full py-1 text-[10px] font-mono transition-colors ${
              isSolverActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-5 h-5 mb-0.5" />
            <span>Solve</span>
          </button>

          {/* 3. Center Elevated SCAN Button */}
          <div className="flex items-center justify-center -mt-5">
            <button
              onClick={onOpenScanner}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-600/40 border-2 border-[#1e2838] active:scale-95 transition-transform"
              title="Scan Question with Camera"
              aria-label="Scan question using camera"
            >
              <Camera className="w-6 h-6" />
              <span className="text-[9px] font-mono font-bold leading-none mt-0.5">SCAN</span>
            </button>
          </div>

          {/* 4. Learn Tab */}
          <button
            onClick={() => handleSelectTab('learn')}
            className={`flex flex-col items-center justify-center h-full w-full py-1 text-[10px] font-mono transition-colors ${
              currentTab === 'learn' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Learn</span>
          </button>

          {/* 5. More / Menu Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center h-full w-full py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
