import { useState } from 'react';
import type { Automaton, ConversionResult } from './types/automata';
import { SAMPLE_PROBLEMS } from './utils/presets';
import {
  convertDfaToNfa,
  convertNfaToDfa,
  convertEnfaToDfa,
  convertEnfaToNfa,
  minimizeDfa,
} from './utils/automataEngine';
import type { NavItem } from './components/Navbar';
import { Navbar } from './components/Navbar';
import { AutomataInput } from './components/Input/AutomataInput';
import { StepByStepSolution } from './components/Solution/StepByStepSolution';
import { AutomataValidatorView } from './components/Validator/AutomataValidatorView';
import { StringSimulator } from './components/Simulator/StringSimulator';
import { LearnAutomata } from './components/Learn/LearnAutomata';
import { CameraScannerModal } from './components/Scanner/CameraScannerModal';
import { ApiKeySettingsModal } from './components/Scanner/ApiKeySettingsModal';
import { Camera } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavItem>('nfa-to-dfa');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scannedNotice, setScannedNotice] = useState<string | null>(null);

  // Automata state storage per mode
  const [dfaState, setDfaState] = useState<Automaton>(
    () => SAMPLE_PROBLEMS.find(p => p.id === 'dfa-even-zeros')!.automaton
  );
  const [nfaState, setNfaState] = useState<Automaton>(
    () => SAMPLE_PROBLEMS.find(p => p.id === 'nfa-ends-in-01')!.automaton
  );
  const [enfaState, setEnfaState] = useState<Automaton>(
    () => SAMPLE_PROBLEMS.find(p => p.id === 'enfa-classic-abb')!.automaton
  );
  const [enfaToNfaState, setEnfaToNfaState] = useState<Automaton>(
    () => SAMPLE_PROBLEMS.find(p => p.id === 'enfa-to-nfa-standard')!.automaton
  );
  const [minimizeState, setMinimizeState] = useState<Automaton>(
    () => SAMPLE_PROBLEMS.find(p => p.id === 'dfa-divisible-by-3')!.automaton
  );

  // Active solution states
  const [dfaSolution, setDfaSolution] = useState<ConversionResult | null>(() =>
    convertDfaToNfa(SAMPLE_PROBLEMS.find(p => p.id === 'dfa-even-zeros')!.automaton)
  );
  const [nfaSolution, setNfaSolution] = useState<ConversionResult | null>(() =>
    convertNfaToDfa(SAMPLE_PROBLEMS.find(p => p.id === 'nfa-ends-in-01')!.automaton)
  );
  const [enfaSolution, setEnfaSolution] = useState<ConversionResult | null>(() =>
    convertEnfaToDfa(SAMPLE_PROBLEMS.find(p => p.id === 'enfa-classic-abb')!.automaton)
  );
  const [enfaToNfaSolution, setEnfaToNfaSolution] = useState<ConversionResult | null>(() =>
    convertEnfaToNfa(SAMPLE_PROBLEMS.find(p => p.id === 'enfa-to-nfa-standard')!.automaton)
  );
  const [minimizeSolution, setMinimizeSolution] = useState<ConversionResult | null>(() =>
    minimizeDfa(SAMPLE_PROBLEMS.find(p => p.id === 'dfa-divisible-by-3')!.automaton)
  );

  // Solver trigger functions
  const handleSolveDfaToNfa = (auto = dfaState) => {
    const res = convertDfaToNfa(auto);
    setDfaSolution(res);
  };

  const handleSolveNfaToDfa = (auto = nfaState) => {
    const res = convertNfaToDfa(auto);
    setNfaSolution(res);
  };

  const handleSolveEnfaToDfa = (auto = enfaState) => {
    const res = convertEnfaToDfa(auto);
    setEnfaSolution(res);
  };

  const handleSolveEnfaToNfa = (auto = enfaToNfaState) => {
    const res = convertEnfaToNfa(auto);
    setEnfaToNfaSolution(res);
  };

  const handleSolveMinimize = (auto = minimizeState) => {
    const res = minimizeDfa(auto);
    setMinimizeSolution(res);
  };

  // Handler when an automaton is scanned and confirmed via Camera AI Vision
  const handleAutomatonExtracted = (
    automaton: Automaton,
    targetConversion?: 'NFA_TO_DFA' | 'ENFA_TO_DFA' | 'ENFA_TO_NFA' | 'DFA_TO_NFA' | 'DFA_MINIMIZATION'
  ) => {
    const target = targetConversion || (
      automaton.type === 'ENFA'
        ? 'ENFA_TO_DFA'
        : automaton.type === 'NFA'
        ? 'NFA_TO_DFA'
        : 'DFA_TO_NFA'
    );

    setScannedNotice(`Loaded scanned ${automaton.type} (${automaton.states.length} states) from photograph.`);

    switch (target) {
      case 'ENFA_TO_DFA':
        setEnfaState(automaton);
        setCurrentTab('enfa-to-dfa');
        handleSolveEnfaToDfa(automaton);
        break;
      case 'ENFA_TO_NFA':
        setEnfaToNfaState(automaton);
        setCurrentTab('enfa-to-nfa');
        handleSolveEnfaToNfa(automaton);
        break;
      case 'DFA_TO_NFA':
        setDfaState(automaton);
        setCurrentTab('dfa-to-nfa');
        handleSolveDfaToNfa(automaton);
        break;
      case 'DFA_MINIMIZATION':
        setMinimizeState(automaton);
        setCurrentTab('minimization');
        handleSolveMinimize(automaton);
        break;
      case 'NFA_TO_DFA':
      default:
        setNfaState(automaton);
        setCurrentTab('nfa-to-dfa');
        handleSolveNfaToDfa(automaton);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app,#182230)] text-[var(--text-primary,#f8fafc)] flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors">
      {/* Engineering Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Camera Scan Callout Banner */}
        <div className="p-3 rounded-lg bg-[var(--bg-card,#222d3d)] border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-slate-200 font-semibold">Live Camera Automata Solver:</span>
            <span className="text-slate-300 hidden md:inline">
              Point your camera at any handwritten or printed state diagram or transition table.
            </span>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold transition-colors shadow-xs"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Question with Camera</span>
          </button>
        </div>

        {scannedNotice && (
          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/80 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span>✓ {scannedNotice}</span>
            <button
              onClick={() => setScannedNotice(null)}
              className="text-slate-400 hover:text-slate-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MODE 1: NFA TO DFA */}
        {currentTab === 'nfa-to-dfa' && (
          <div className="space-y-6">
            <div className="border-b border-slate-700/60 pb-2">
              <h1 className="text-base font-mono font-bold text-white">
                NFA → DFA Conversion (Rabin-Scott Subset Construction)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Constructs equivalent DFA by exploring reachable subsets from {'{q₀}'}. Eliminates unreachable power-set states.
              </p>
            </div>

            <AutomataInput
              value={nfaState}
              onChange={updated => {
                setNfaState(updated);
                handleSolveNfaToDfa(updated);
              }}
              expectedType="NFA"
              onSolve={() => handleSolveNfaToDfa()}
            />

            {nfaSolution && <StepByStepSolution result={nfaSolution} />}
          </div>
        )}

        {/* MODE 2: ε-NFA TO DFA */}
        {currentTab === 'enfa-to-dfa' && (
          <div className="space-y-6">
            <div className="border-b border-slate-700/60 pb-2">
              <h1 className="text-base font-mono font-bold text-white">
                ε-NFA → DFA Conversion (Epsilon Closure & Subset Construction)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Computes ε-closure for each state, sets initial state to ε-closure(q₀), and derives deterministic moves: δ'(S, a) = ε-closure(move(S, a)).
              </p>
            </div>

            <AutomataInput
              value={enfaState}
              onChange={updated => {
                setEnfaState(updated);
                handleSolveEnfaToDfa(updated);
              }}
              expectedType="ENFA"
              onSolve={() => handleSolveEnfaToDfa()}
            />

            {enfaSolution && <StepByStepSolution result={enfaSolution} />}
          </div>
        )}

        {/* MODE 3: ε-NFA TO NFA */}
        {currentTab === 'enfa-to-nfa' && (
          <div className="space-y-6">
            <div className="border-b border-slate-700/60 pb-2">
              <h1 className="text-base font-mono font-bold text-white">
                ε-NFA → NFA Conversion (Epsilon Elimination)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Eliminates ε-transitions while preserving the exact state set Q. Maps δ'(q, a) = ε-closure(move(ε-closure(q), a)).
              </p>
            </div>

            <AutomataInput
              value={enfaToNfaState}
              onChange={updated => {
                setEnfaToNfaState(updated);
                handleSolveEnfaToNfa(updated);
              }}
              expectedType="ENFA"
              onSolve={() => handleSolveEnfaToNfa()}
            />

            {enfaToNfaSolution && <StepByStepSolution result={enfaToNfaSolution} />}
          </div>
        )}

        {/* MODE 4: DFA TO NFA */}
        {currentTab === 'dfa-to-nfa' && (
          <div className="space-y-6">
            <div className="border-b border-slate-700/60 pb-2">
              <h1 className="text-base font-mono font-bold text-white">
                DFA → NFA Conversion (Singleton Embedding)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Formal proof of inclusion: maps each scalar transition δ(q, a) = p into singleton set δ'(q, a) = {'{p}'}.
              </p>
            </div>

            <AutomataInput
              value={dfaState}
              onChange={updated => {
                setDfaState(updated);
                handleSolveDfaToNfa(updated);
              }}
              expectedType="DFA"
              onSolve={() => handleSolveDfaToNfa()}
            />

            {dfaSolution && <StepByStepSolution result={dfaSolution} />}
          </div>
        )}

        {/* MODE 5: DFA MINIMIZER */}
        {currentTab === 'minimization' && (
          <div className="space-y-6">
            <div className="border-b border-slate-700/60 pb-2">
              <h1 className="text-base font-mono font-bold text-white">
                DFA Minimization (Table-Filling / Myhill-Nerode Algorithm)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Removes unreachable states, marks distinguishable pairs (p, q), and collapses indistinguishable equivalence classes into the minimal DFA.
              </p>
            </div>

            <AutomataInput
              value={minimizeState}
              onChange={updated => {
                setMinimizeState(updated);
                handleSolveMinimize(updated);
              }}
              expectedType="DFA"
              onSolve={() => handleSolveMinimize()}
            />

            {minimizeSolution && <StepByStepSolution result={minimizeSolution} />}
          </div>
        )}

        {/* MODE 6: STRING SIMULATOR */}
        {currentTab === 'simulator' && (
          <div className="space-y-6">
            <AutomataInput
              value={nfaState}
              onChange={updated => setNfaState(updated)}
            />
            <StringSimulator automaton={nfaState} />
          </div>
        )}

        {/* MODE 7: VALIDATOR */}
        {currentTab === 'validator' && (
          <div className="space-y-6">
            <AutomataInput
              value={nfaState}
              onChange={updated => setNfaState(updated)}
            />
            <AutomataValidatorView automaton={nfaState} />
          </div>
        )}

        {/* MODE 8: THEORY NOTES */}
        {currentTab === 'learn' && <LearnAutomata />}
      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-slate-700/60 bg-[#0d1117] py-4 px-6 text-slate-500 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>Automata Solver • Formal Languages & Automata Theory</div>
          <div className="text-slate-600">Rabin-Scott • Myhill-Nerode • Multimodal AI Vision</div>
        </div>
      </footer>

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAutomatonExtracted={handleAutomatonExtracted}
        onOpenSettings={() => {
          setIsScannerOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* API Key Settings Modal */}
      <ApiKeySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={() => {
          // Re-open scanner if user was scanning
          setIsSettingsOpen(false);
          setIsScannerOpen(true);
        }}
      />
    </div>
  );
}

export default App;
