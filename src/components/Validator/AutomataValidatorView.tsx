import React from 'react';
import type { Automaton } from '../../types/automata';
import { validateAutomaton } from '../../utils/automataValidator';
import { AutomataDiagram } from '../Diagram/AutomataDiagram';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface AutomataValidatorViewProps {
  automaton: Automaton;
}

export const AutomataValidatorView: React.FC<AutomataValidatorViewProps> = ({ automaton }) => {
  const report = validateAutomaton(automaton);

  return (
    <div className="space-y-5 text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">Automata Validator & Static Analyzer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifies 5-tuple consistency, alphabet completeness, graph reachability, and trap states.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 font-semibold ${
              report.isValid
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}
          >
            {report.isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            <span>{report.isValid ? 'Specification Valid' : 'Specification Errors'}</span>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
            Type: {report.detectedType}
          </div>
        </div>
      </div>

      {/* Errors or Warnings */}
      {report.errors.length > 0 && (
        <div className="p-3.5 rounded border border-rose-800 bg-rose-950/30 space-y-1.5 text-xs font-mono">
          <div className="font-semibold text-rose-300 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            <span>Errors ({report.errors.length}):</span>
          </div>
          <ul className="space-y-0.5 text-rose-200 pl-5 list-disc">
            {report.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {report.warnings.length > 0 && (
        <div className="p-3.5 rounded border border-amber-800 bg-amber-950/30 space-y-1.5 text-xs font-mono">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Warnings ({report.warnings.length}):</span>
          </div>
          <ul className="space-y-0.5 text-amber-200 pl-5 list-disc">
            {report.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-1 font-mono text-xs">
          <div className="text-slate-500 text-[11px]">CLASSIFICATION</div>
          <div className="text-base font-bold text-indigo-300">{report.detectedType}</div>
          <div className="text-slate-400 text-[11px] font-sans">
            {report.detectedType === 'DFA' && 'Deterministic transitions (δ: Q × Σ → Q).'}
            {report.detectedType === 'NFA' && 'Non-deterministic branching.'}
            {report.detectedType === 'ENFA' && 'Contains spontaneous ε-transitions.'}
          </div>
        </div>

        <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-1 font-mono text-xs">
          <div className="text-slate-500 text-[11px]">TRANSITION TOTALITY</div>
          <div
            className={`text-base font-bold ${
              report.completeness.isComplete ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {report.completeness.isComplete ? 'Complete' : 'Incomplete'}
          </div>
          <div className="text-slate-400 text-[11px] font-sans">
            {report.completeness.isComplete
              ? 'Every state has defined transitions for all symbols.'
              : `${report.completeness.missingTransitions.length} undefined transition(s).`}
          </div>
        </div>

        <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-1 font-mono text-xs">
          <div className="text-slate-500 text-[11px]">REACHABILITY</div>
          <div className="text-base font-bold text-slate-200">
            {report.reachability.reachable.length}/{report.stats.stateCount}
          </div>
          <div className="text-slate-400 text-[11px] font-sans">
            {report.reachability.unreachable.length === 0
              ? 'All states reachable from q₀.'
              : `Unreachable: ${report.reachability.unreachable.join(', ')}`}
          </div>
        </div>

        <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-1 font-mono text-xs">
          <div className="text-slate-500 text-[11px]">DEAD / TRAP STATES</div>
          <div
            className={`text-base font-bold ${
              report.deadStates.dead.length === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {report.deadStates.dead.length === 0 ? 'None' : report.deadStates.dead.join(', ')}
          </div>
          <div className="text-slate-400 text-[11px] font-sans">
            {report.deadStates.dead.length === 0
              ? 'All reachable states have a path to F.'
              : 'Cannot reach any accepting state.'}
          </div>
        </div>
      </div>

      {/* State Diagram */}
      <div className="space-y-1.5">
        <div className="text-xs font-mono font-semibold text-slate-300">
          Automaton Topology
        </div>
        <AutomataDiagram automaton={automaton} title="Graph Topology" />
      </div>

      {/* Reachability & Dead States Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
          <div className="text-slate-300 font-semibold border-b border-slate-700/60 pb-1">
            Reachability Analysis
          </div>
          <div className="space-y-1 text-slate-300">
            <div>
              <span className="text-slate-500">Reachable from q₀ ({automaton.initialState}): </span>
              {`{${report.reachability.reachable.join(', ')}}`}
            </div>
            <div>
              <span className="text-slate-500">Unreachable: </span>
              {report.reachability.unreachable.length > 0
                ? `{${report.reachability.unreachable.join(', ')}}`
                : '∅'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
          <div className="text-slate-300 font-semibold border-b border-slate-700/60 pb-1">
            Dead State & Trap State Diagnostics
          </div>
          <div className="space-y-1 text-slate-300">
            <div>
              <span className="text-slate-500">Dead States (no path to F): </span>
              {report.deadStates.dead.length > 0 ? `{${report.deadStates.dead.join(', ')}}` : '∅'}
            </div>
            <div>
              <span className="text-slate-500">Trap States (self-loop sink): </span>
              {report.deadStates.trap.length > 0 ? `{${report.deadStates.trap.join(', ')}}` : '∅'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
