import React from 'react';
import {
  ArrowRight,
  GitCommit,
  GitBranch,
  Sparkles,
  BookOpen,
  Zap,
  Terminal,
  Layers,
  ChevronRight,
  Minimize2,
} from 'lucide-react';

interface DashboardHomeProps {
  onSelectFeature: (feature: 'dfa-to-nfa' | 'nfa-to-dfa' | 'enfa-to-dfa' | 'enfa-to-nfa' | 'minimization' | 'validator' | 'learn' | 'simulator') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onSelectFeature }) => {
  return (
    <div className="space-y-8 sm:space-y-12 py-2 sm:py-4">
      {/* Hero Section */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-700/60 bg-gradient-to-b from-[#222d3d] via-[#1c2738] to-[#182230] p-5 sm:p-8 md:p-12 overflow-hidden shadow-xl">
        {/* Glow backdrop circles */}
        <div className="absolute -top-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">Computer Science Engineering Automata Assistant</span>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              AUTOMATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">SOLVER</span>
            </h1>
            <p className="text-sm xs:text-base sm:text-xl font-medium text-slate-300 tracking-wide">
              Your Complete Automata Theory Companion
            </p>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            Solve virtually any well-formed DFA, NFA, and ε-NFA conversion problem. Get rigorous mathematical solutions step-by-step with intermediate subset moves, ε-closures, power set calculations, and interactive state diagrams tailored for university examinations.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <button
              onClick={() => onSelectFeature('nfa-to-dfa')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 min-h-[46px]"
            >
              <span>Solve NFA to DFA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectFeature('enfa-to-dfa')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2a374c] hover:bg-slate-700 text-slate-100 border border-slate-600/80 font-semibold text-sm active:scale-98 transition-all flex items-center justify-center gap-2 min-h-[46px]"
            >
              <span>Solve ε-NFA to DFA</span>
            </button>

            <button
              onClick={() => onSelectFeature('learn')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1e2838]/80 hover:bg-[#2a374c] text-slate-300 hover:text-white border border-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-2 min-h-[46px]"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Exam Notes & Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversion Cards */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
            Core Solvers
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            Primary Conversion Engines
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: NFA to DFA */}
          <div
            onClick={() => onSelectFeature('nfa-to-dfa')}
            className="group relative rounded-2xl border border-slate-700/60 bg-[#222d3d]/90 p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-cyan-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-lg active:scale-98"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GitBranch className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                1. NFA to DFA
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rabin-Scott subset construction with full powerset exploration, reachable state mapping, and trap/dead-state detection.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Launch Solver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: ε-NFA to DFA */}
          <div
            onClick={() => onSelectFeature('enfa-to-dfa')}
            className="group relative rounded-2xl border border-slate-700/60 bg-[#222d3d]/90 p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-purple-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-lg active:scale-98"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                2. ε-NFA to DFA
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete ε-closure computation for each state, subset construction, and deterministic transition table generation.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Launch Solver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: DFA to NFA */}
          <div
            onClick={() => onSelectFeature('dfa-to-nfa')}
            className="group relative rounded-2xl border border-slate-700/60 bg-[#222d3d]/90 p-5 sm:p-6 space-y-3 sm:space-y-4 hover:border-indigo-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-lg active:scale-98"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GitCommit className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                3. DFA to NFA
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Demonstrates formal inclusion, showing why every DFA is intrinsically an NFA with singleton set mapping δ'(q, a) = {'{δ(q, a)}'}.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span>Launch Solver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics & Study Suite */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            Interactive Tools
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            Diagnostics, Simulator & Study Suite
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Tool 1: ε-NFA to NFA */}
          <div
            onClick={() => onSelectFeature('enfa-to-nfa')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-4 sm:p-5 space-y-2.5 hover:border-pink-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-md active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
              ε-NFA to NFA
            </h4>
            <p className="text-xs text-slate-300">
              Epsilon elimination via δ'(q, a) = ε-closure(move(ε-closure(q), a)).
            </p>
          </div>

          {/* Tool 2: DFA Minimizer */}
          <div
            onClick={() => onSelectFeature('minimization')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-4 sm:p-5 space-y-2.5 hover:border-emerald-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-md active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Minimize2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              DFA Minimizer
            </h4>
            <p className="text-xs text-slate-300">
              Myhill-Nerode table-filling theorem for minimal deterministic machines.
            </p>
          </div>

          {/* Tool 3: String Simulator */}
          <div
            onClick={() => onSelectFeature('simulator')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-4 sm:p-5 space-y-2.5 hover:border-cyan-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-md active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              String Simulator
            </h4>
            <p className="text-xs text-slate-300">
              Step through input strings with animated active state tracking on tape.
            </p>
          </div>

          {/* Tool 4: Learn Automata Theory */}
          <div
            onClick={() => onSelectFeature('learn')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-4 sm:p-5 space-y-2.5 hover:border-purple-500/50 hover:bg-[#273447] transition-all cursor-pointer shadow-md active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Theory Notes & Quiz
            </h4>
            <p className="text-xs text-slate-300">
              Curriculum notes, comparison tables, and self-assessment quiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
