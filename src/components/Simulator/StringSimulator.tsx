import React, { useState } from 'react';
import type { Automaton, SimulationResult } from '../../types/automata';
import { simulateString } from '../../utils/automataValidator';
import { AutomataDiagram } from '../Diagram/AutomataDiagram';
import {
  Play,
  RotateCcw,
  StepForward,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface StringSimulatorProps {
  automaton: Automaton;
}

export const StringSimulator: React.FC<StringSimulatorProps> = ({ automaton }) => {
  const [testInput, setTestInput] = useState('01');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleSimulate = (inputStr = testInput) => {
    const res = simulateString(automaton, inputStr);
    setSimulation(res);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (!simulation) return;
    if (currentStepIndex < simulation.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  const currentStep = simulation?.steps[currentStepIndex];
  const activeStates = currentStep ? currentStep.activeStates : [automaton.initialState];
  const highlightTransition =
    currentStep && currentStep.transitionsTaken.length > 0
      ? currentStep.transitionsTaken[0]
      : null;

  return (
    <div className="space-y-5 text-slate-200">
      {/* Header and input bar */}
      <div className="bg-[#222d3d] p-4 rounded border border-slate-700/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
          <div>
            <h2 className="text-base font-mono font-bold text-white">String Acceptance Simulator</h2>
            <p className="text-xs text-slate-400">
              Traces computation path across state transitions for any string w ∈ Σ*.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Alphabet Σ = {'{'}{automaton.alphabet.join(', ')}{'}'}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder={`Enter test string (e.g. 0101)`}
              value={testInput}
              onChange={e => setTestInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSimulate()}
              className="w-full bg-[#1a2535] border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => handleSimulate()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>

          {/* Quick presets */}
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <span>Preset strings:</span>
            {['01', '0101', '10', '000'].map(sample => (
              <button
                key={sample}
                onClick={() => {
                  setTestInput(sample);
                  handleSimulate(sample);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Execution Area */}
      {simulation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Graph view */}
          <div className="lg:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-semibold">Active State Traversal</span>
              <span className="text-emerald-400">
                Active: {`{${activeStates.join(', ') || '∅'}}`}
              </span>
            </div>

            <AutomataDiagram
              automaton={automaton}
              activeStates={activeStates}
              highlightTransition={highlightTransition}
            />
          </div>

          {/* Controls & Decision */}
          <div className="space-y-4">
            {/* Decision Result */}
            <div
              className={`p-4 rounded border text-xs font-mono ${
                simulation.accepted
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {simulation.accepted ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {simulation.accepted ? 'STRING ACCEPTED' : 'STRING REJECTED'}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    w = "{simulation.inputString}"
                  </div>
                </div>
              </div>
              <p className="text-slate-300 border-t border-slate-700/60/80 pt-2 font-sans text-xs leading-relaxed">
                {simulation.reason}
              </p>
            </div>

            {/* Stepper */}
            <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Step Controls</span>
                <span className="text-slate-300">
                  {currentStepIndex} / {Math.max(0, simulation.steps.length - 1)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs transition-colors"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Reset to initial state"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStepIndex >= simulation.steps.length - 1}
                  className="flex-1 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs transition-colors flex items-center justify-center gap-1 font-semibold"
                >
                  <span>Next</span>
                  <StepForward className="w-3 h-3" />
                </button>
              </div>

              {currentStep && (
                <div className="p-2.5 rounded bg-[#1a2535] border border-slate-700/60 text-[11px] space-y-1">
                  <div className="font-semibold text-cyan-300">
                    Step {currentStep.stepIndex}:{' '}
                    {currentStep.symbolConsumed
                      ? `Read '${currentStep.symbolConsumed}'`
                      : 'Initial Configuration'}
                  </div>
                  <div className="text-slate-400 font-sans leading-relaxed">
                    {currentStep.description}
                  </div>
                </div>
              )}
            </div>

            {/* Input Tape */}
            <div className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-2 font-mono text-xs">
              <span className="text-slate-400">Input Tape:</span>
              <div className="flex flex-wrap gap-1 font-mono">
                {simulation.inputString.length === 0 ? (
                  <span className="text-slate-500 text-xs italic">ε (empty string)</span>
                ) : (
                  simulation.inputString.split('').map((char, idx) => {
                    const isProcessed = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex - 1;

                    return (
                      <span
                        key={idx}
                        className={`w-6 h-6 flex items-center justify-center rounded border text-xs ${
                          isCurrent
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                            : isProcessed
                            ? 'bg-slate-800/80 border-slate-700 text-slate-500'
                            : 'bg-[#1a2535] border-slate-700/60 text-slate-200'
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
