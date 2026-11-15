import React from 'react';
import {
  ArrowRight,
  GitCommit,
  GitBranch,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Zap,
  Terminal,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface DashboardHomeProps {
  onSelectFeature: (feature: 'dfa-to-nfa' | 'nfa-to-dfa' | 'enfa-to-dfa' | 'enfa-to-nfa' | 'validator' | 'learn' | 'simulator') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onSelectFeature }) => {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl border border-slate-700/60 bg-gradient-to-b from-[#222d3d] via-[#1c2738] to-[#182230] p-8 sm:p-12 overflow-hidden shadow-xl">
        {/* Glow backdrop circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Designed for 3rd-Year Computer Science Engineering</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              AUTOMATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">SOLVER</span>
            </h1>
            <p className="text-lg sm:text-xl font-medium text-slate-300 tracking-wide">
              Your Complete Automata Theory Companion
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Solve virtually any well-formed DFA, NFA, and ε-NFA conversion problem. Get rigorous mathematical solutions step-by-step with intermediate subset moves, ε-closures, power set calculations, and interactive state diagrams tailored for university examinations.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectFeature('nfa-to-dfa')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Solve NFA to DFA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectFeature('enfa-to-dfa')}
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Solve ε-NFA to DFA</span>
            </button>

            <button
              onClick={() => onSelectFeature('learn')}
              className="px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium text-sm transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Exam Notes & Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversion Cards (Section 1: Three Main Cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Core Solvers
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Primary Conversion Engines
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: DFA to NFA */}
          <div
            onClick={() => onSelectFeature('dfa-to-nfa')}
            className="group relative rounded-2xl border border-slate-700/60 bg-[#222d3d]/90 p-6 space-y-4 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitCommit className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                1. DFA to NFA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demonstrates formal inclusion, showing why every DFA is intrinsically an NFA with singleton set mapping δ'(q, a) = {'{δ(q, a)}'}.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Launch Solver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: NFA to DFA */}
          <div
            onClick={() => onSelectFeature('nfa-to-dfa')}
            className="group relative rounded-2xl border border-slate-700/60 bg-[#222d3d]/90 p-6 space-y-4 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                2. NFA to DFA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full Rabin-Scott Subset Construction. Computes all reachable subsets, handles dead states, removes unreachable states, and maps final subsets.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Launch Solver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: ε-NFA to DFA */}
          <div
            onClick={() => onSelectFeature('enfa-to-dfa')}
            className="group relative rounded-2xl border border-slate-700/60 bg-[#222d3d]/90 p-6 space-y-4 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                3. ε-NFA to DFA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step ε-closure computation followed by subset construction. Shows move(S, a) and ε-closure(move) at every transition step.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-400">
              <span>Launch Solver</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Additional Tooling
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Diagnostics, Simulator & Study Suite
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Tool 1: ε-NFA to NFA */}
          <div
            onClick={() => onSelectFeature('enfa-to-nfa')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-5 space-y-3 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer shadow-md hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
              ε-NFA to NFA
            </h4>
            <p className="text-xs text-slate-400">
              Epsilon elimination via δ'(q, a) = ε-closure(move(ε-closure(q), a)).
            </p>
          </div>

          {/* Tool 2: Automata Validator */}
          <div
            onClick={() => onSelectFeature('validator')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-5 space-y-3 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer shadow-md hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Automata Validator
            </h4>
            <p className="text-xs text-slate-400">
              Tests 5-tuple consistency, completeness, dead states, and unreachable states.
            </p>
          </div>

          {/* Tool 3: String Simulator */}
          <div
            onClick={() => onSelectFeature('simulator')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-5 space-y-3 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer shadow-md hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              String Acceptance Tester
            </h4>
            <p className="text-xs text-slate-400">
              Step through input strings with animated active state tracking.
            </p>
          </div>

          {/* Tool 4: Learn Automata Theory */}
          <div
            onClick={() => onSelectFeature('learn')}
            className="group rounded-2xl border border-slate-700/60 bg-[#222d3d]/80 p-5 space-y-3 hover:border-slate-700 hover:bg-slate-900/80 transition-all cursor-pointer shadow-md hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Learn Automata Theory
            </h4>
            <p className="text-xs text-slate-400">
              Curriculum notes, comparison tables, and self-assessment quiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
