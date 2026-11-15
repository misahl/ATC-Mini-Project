import React, { useState } from 'react';
import type { Automaton, AutomatonType } from '../../types/automata';
import { EPSILON } from '../../types/automata';
import type { SampleProblem } from '../../utils/presets';
import { SAMPLE_PROBLEMS } from '../../utils/presets';
import { isEpsilon } from '../../utils/automataEngine';
import { Plus, AlertCircle, ArrowRight } from 'lucide-react';

interface AutomataInputProps {
  value: Automaton;
  onChange: (updated: Automaton) => void;
  expectedType?: AutomatonType;
  onSolve?: () => void;
}

export const AutomataInput: React.FC<AutomataInputProps> = ({
  value,
  onChange,
  expectedType,
  onSolve,
}) => {
  const [newStateName, setNewStateName] = useState('');
  const [newSymbolName, setNewSymbolName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const relevantSamples = SAMPLE_PROBLEMS.filter(p => {
    if (!expectedType) return true;
    if (expectedType === 'DFA') return p.automaton.type === 'DFA';
    if (expectedType === 'NFA') return p.automaton.type === 'NFA';
    if (expectedType === 'ENFA') return p.automaton.type === 'ENFA';
    return true;
  });

  const handleLoadSample = (sample: SampleProblem) => {
    onChange({
      ...sample.automaton,
      type: expectedType || sample.automaton.type,
    });
    setErrorMsg(null);
  };

  const handleAddState = () => {
    const trimmed = newStateName.trim();
    if (!trimmed) return;
    if (value.states.includes(trimmed)) {
      setErrorMsg(`State "${trimmed}" already exists.`);
      return;
    }
    const updatedStates = [...value.states, trimmed];
    const updatedTransitions = { ...value.transitions, [trimmed]: {} };
    onChange({
      ...value,
      states: updatedStates,
      initialState: value.initialState || trimmed,
      transitions: updatedTransitions,
    });
    setNewStateName('');
    setErrorMsg(null);
  };

  const handleQuickAddNextState = () => {
    let nextIdx = value.states.length;
    let candidate = `q${nextIdx}`;
    while (value.states.includes(candidate)) {
      nextIdx++;
      candidate = `q${nextIdx}`;
    }
    const updatedStates = [...value.states, candidate];
    const updatedTransitions = { ...value.transitions, [candidate]: {} };
    onChange({
      ...value,
      states: updatedStates,
      initialState: value.initialState || candidate,
      transitions: updatedTransitions,
    });
  };

  const handleRemoveState = (stateToRemove: string) => {
    if (value.states.length <= 1) {
      setErrorMsg('An automaton must have at least one state.');
      return;
    }
    const updatedStates = value.states.filter(s => s !== stateToRemove);
    const updatedFinals = value.finalStates.filter(s => s !== stateToRemove);
    const updatedInitial =
      value.initialState === stateToRemove ? updatedStates[0] : value.initialState;

    const updatedTransitions: Record<string, Record<string, string[]>> = {};
    for (const st of updatedStates) {
      updatedTransitions[st] = {};
      const currentTr = value.transitions[st] || {};
      for (const [sym, targets] of Object.entries(currentTr)) {
        if (targets) {
          updatedTransitions[st][sym] = targets.filter(t => t !== stateToRemove);
        }
      }
    }

    onChange({
      ...value,
      states: updatedStates,
      initialState: updatedInitial,
      finalStates: updatedFinals,
      transitions: updatedTransitions,
    });
    setErrorMsg(null);
  };

  const handleAddSymbol = () => {
    const trimmed = newSymbolName.trim();
    if (!trimmed) return;
    if (value.alphabet.includes(trimmed)) {
      setErrorMsg(`Symbol "${trimmed}" already exists.`);
      return;
    }
    onChange({
      ...value,
      alphabet: [...value.alphabet, trimmed],
    });
    setNewSymbolName('');
    setErrorMsg(null);
  };

  const handleRemoveSymbol = (symToRemove: string) => {
    if (value.alphabet.length <= 1) {
      setErrorMsg('An automaton must have at least one alphabet symbol.');
      return;
    }
    const updatedAlphabet = value.alphabet.filter(s => s !== symToRemove);
    const updatedTransitions = { ...value.transitions };
    for (const st of value.states) {
      if (updatedTransitions[st]) {
        const copy = { ...updatedTransitions[st] };
        delete copy[symToRemove];
        updatedTransitions[st] = copy;
      }
    }
    onChange({
      ...value,
      alphabet: updatedAlphabet,
      transitions: updatedTransitions,
    });
    setErrorMsg(null);
  };

  const handleToggleFinal = (state: string) => {
    const isCurrentlyFinal = value.finalStates.includes(state);
    const updatedFinals = isCurrentlyFinal
      ? value.finalStates.filter(s => s !== state)
      : [...value.finalStates, state];
    onChange({
      ...value,
      finalStates: updatedFinals,
    });
  };

  const handleCellChange = (state: string, symbol: string, rawInput: string) => {
    const cleaned = rawInput.replace(/[{}]/g, '');
    const tokens = cleaned
      .split(/[\s,]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const validTokens = value.type === 'DFA' && tokens.length > 1 ? [tokens[0]] : tokens;

    const updatedTransitions = {
      ...value.transitions,
      [state]: {
        ...(value.transitions[state] || {}),
        [symbol]: validTokens,
      },
    };
    onChange({
      ...value,
      transitions: updatedTransitions,
    });
  };

  const hasEpsilonCol = value.alphabet.some(isEpsilon);
  const handleToggleEpsilon = () => {
    if (hasEpsilonCol) {
      const updatedAlphabet = value.alphabet.filter(s => !isEpsilon(s));
      const updatedTransitions = { ...value.transitions };
      for (const st of value.states) {
        if (updatedTransitions[st]) {
          const copy = { ...updatedTransitions[st] };
          Object.keys(copy).forEach(k => {
            if (isEpsilon(k)) delete copy[k];
          });
          updatedTransitions[st] = copy;
        }
      }
      onChange({
        ...value,
        type: value.type === 'ENFA' ? 'NFA' : value.type,
        alphabet: updatedAlphabet,
        transitions: updatedTransitions,
      });
    } else {
      onChange({
        ...value,
        type: 'ENFA',
        alphabet: [...value.alphabet, EPSILON],
      });
    }
  };

  const standardSymbols = value.alphabet.filter(s => !isEpsilon(s));
  const tableSymbols = hasEpsilonCol ? [...standardSymbols, EPSILON] : standardSymbols;

  return (
    <div className="bg-[#222d3d] rounded-lg border border-slate-700/60 p-5 space-y-5 text-slate-200">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Formal Definition:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-semibold">
            M = (Q, Σ, δ, q₀, F)
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/60">
            {value.type}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Preset:</span>
          <select
            aria-label="Preset problem"
            onChange={e => {
              const selected = SAMPLE_PROBLEMS.find(p => p.id === e.target.value);
              if (selected) handleLoadSample(selected);
            }}
            defaultValue=""
            className="bg-[#1a2535] border border-slate-700 text-slate-300 rounded px-2.5 py-1 text-xs font-mono focus:border-indigo-500 focus:outline-none"
          >
            <option value="" disabled>
              Select textbook example...
            </option>
            {relevantSamples.map(sample => (
              <option key={sample.id} value={sample.id}>
                {sample.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs px-3 py-2 rounded">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: States (Q) and Alphabet (Σ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* States Q */}
        <div className="bg-[#1a2535] p-3.5 rounded border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold text-slate-300">
              States Q = {'{'}{value.states.join(', ')}{'}'}
            </span>
            <button
              onClick={handleQuickAddNextState}
              className="text-indigo-400 hover:text-indigo-300 font-mono text-xs flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>+q{value.states.length}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-7">
            {value.states.map(state => (
              <span
                key={state}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
              >
                <span>{state}</span>
                {value.states.length > 1 && (
                  <button
                    onClick={() => handleRemoveState(state)}
                    className="text-slate-500 hover:text-rose-400 text-xs"
                    title={`Delete ${state}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Add state name (e.g. q3)"
              value={newStateName}
              onChange={e => setNewStateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddState()}
              className="flex-1 bg-[#222d3d] border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
            />
            <button
              onClick={handleAddState}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Alphabet Σ */}
        <div className="bg-[#1a2535] p-3.5 rounded border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-semibold text-slate-300">
              Alphabet Σ = {'{'}{standardSymbols.join(', ')}{'}'}
            </span>
            <button
              onClick={handleToggleEpsilon}
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                hasEpsilonCol
                  ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {hasEpsilonCol ? 'ε (Epsilon Enabled)' : '+ Enable ε (Epsilon)'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-7">
            {standardSymbols.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300"
              >
                <span>{sym}</span>
                {standardSymbols.length > 1 && (
                  <button
                    onClick={() => handleRemoveSymbol(sym)}
                    className="text-slate-500 hover:text-rose-400 text-xs"
                    title={`Delete ${sym}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {hasEpsilonCol && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/80 text-xs font-mono text-purple-300">
                ε
              </span>
            )}
          </div>

          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Add symbol (e.g. 0, 1, a, b)"
              value={newSymbolName}
              onChange={e => setNewSymbolName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSymbol()}
              className="flex-1 bg-[#222d3d] border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
            />
            <button
              onClick={handleAddSymbol}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Initial State q0 & Final States F */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Initial state */}
        <div className="bg-[#1a2535] p-3 rounded border border-slate-700/60 flex items-center justify-between text-xs">
          <label className="font-mono font-semibold text-slate-300">
            Initial State (q₀):
          </label>
          <select
            aria-label="Initial state"
            value={value.initialState}
            onChange={e => onChange({ ...value, initialState: e.target.value })}
            className="bg-[#222d3d] border border-slate-700 text-slate-200 text-xs font-mono rounded px-2.5 py-1 focus:outline-none"
          >
            {value.states.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Final states */}
        <div className="bg-[#1a2535] p-3 rounded border border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono font-semibold text-slate-300">
            Final States (F):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {value.states.map(s => {
              const isFinal = value.finalStates.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => handleToggleFinal(s)}
                  className={`px-2 py-0.5 rounded font-mono text-xs border transition-colors ${
                    isFinal
                      ? 'bg-purple-900/60 border-purple-600 text-purple-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isFinal ? `*${s}` : s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transition Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-slate-300">
            Transition Function δ: Q × Σ → {value.type === 'DFA' ? 'Q' : '2^Q'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {value.type === 'DFA'
              ? 'Enter single state per cell (or leave empty)'
              : 'Enter comma-separated states (e.g. q0, q1) or leave empty'}
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-700/60 bg-[#1a2535]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/80 font-mono text-slate-300">
                <th className="py-2 px-3 w-32 border-r border-slate-700/60">State</th>
                {tableSymbols.map(sym => (
                  <th
                    key={sym}
                    className={`py-2 px-3 text-center border-r border-slate-700/60 last:border-none ${
                      isEpsilon(sym) ? 'text-purple-400' : 'text-cyan-400'
                    }`}
                  >
                    {isEpsilon(sym) ? 'ε' : sym}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {value.states.map(state => {
                const isInit = state === value.initialState;
                const isFin = value.finalStates.includes(state);

                return (
                  <tr key={state} className="hover:bg-slate-900/40">
                    <td className="py-1.5 px-3 font-semibold text-slate-200 border-r border-slate-700/60">
                      <span className="text-slate-400 mr-1.5">
                        {isInit ? '→' : ''}{isFin ? '*' : ''}
                      </span>
                      <span>{state}</span>
                    </td>

                    {tableSymbols.map(sym => {
                      const targets = value.transitions[state]?.[sym] || [];
                      const cellValue = targets.join(', ');

                      return (
                        <td
                          key={sym}
                          className="py-1 px-2 border-r border-slate-700/60 last:border-none"
                        >
                          <input
                            type="text"
                            placeholder="∅"
                            value={cellValue}
                            onChange={e => handleCellChange(state, sym, e.target.value)}
                            className="w-full bg-[#222d3d] border border-slate-700/60 rounded px-2 py-1 text-xs text-center text-slate-200 font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-700"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solve Button */}
      {onSolve && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onSolve}
            className="flex items-center gap-2 px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Run Conversion Algorithm</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
