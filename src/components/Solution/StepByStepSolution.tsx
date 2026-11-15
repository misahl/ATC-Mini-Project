import React, { useState } from 'react';
import type { ConversionResult } from '../../types/automata';
import { AutomataDiagram } from '../Diagram/AutomataDiagram';
import {
  CheckCircle2,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StepByStepSolutionProps {
  result: ConversionResult;
  viewSection?: 'all' | 'diagram' | 'solution';
}

export const StepByStepSolution: React.FC<StepByStepSolutionProps> = ({
  result,
  viewSection = 'all',
}) => {
  const [activeDiagramTab, setActiveDiagramTab] = useState<'converted' | 'original'>(
    'converted'
  );
  const [collapsedSteps, setCollapsedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setCollapsedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleCopyMarkdown = () => {
    let md = `# ${result.title} - Step-by-Step Solution\n\n`;
    md += `## 1. Input Automaton Specification\n`;
    md += `- **Type**: ${result.originalAutomaton.type}\n`;
    md += `- **Q (States)**: {${result.originalAutomaton.states.join(', ')}}\n`;
    md += `- **Σ (Alphabet)**: {${result.originalAutomaton.alphabet.join(', ')}}\n`;
    md += `- **q₀ (Start State)**: ${result.originalAutomaton.initialState}\n`;
    md += `- **F (Final States)**: {${result.originalAutomaton.finalStates.join(', ')}}\n\n`;

    md += `## 2. Algorithm & Theoretical Basis\n`;
    md += `Algorithm: ${result.theoreticalNotes.algorithmName}\n`;
    md += `${result.theoreticalNotes.definition}\n\n`;

    md += `## 3. Step-by-Step Calculations\n`;
    for (const step of result.steps) {
      md += `### Step ${step.stepNumber}: ${step.title}\n`;
      md += `${step.description}\n\n`;
      if (step.mathFormula) {
        md += `Formula: \`${step.mathFormula}\`\n\n`;
      }
      if (step.details && step.details.length > 0) {
        step.details.forEach(d => {
          md += `- ${d}\n`;
        });
        md += `\n`;
      }
    }

    md += `## 4. Converted Automaton\n`;
    md += `- **Type**: ${result.convertedAutomaton.type}\n`;
    md += `- **States**: {${result.convertedAutomaton.states.join(', ')}}\n`;
    md += `- **Initial State**: ${result.convertedAutomaton.initialState}\n`;
    md += `- **Final States**: {${result.convertedAutomaton.finalStates.join(', ')}}\n`;

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Title bar - show on all or solution */}
      {viewSection !== 'diagram' && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-mono font-bold text-white flex flex-wrap items-center gap-2">
              <span>{result.title}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-normal">
                {result.theoreticalNotes.algorithmName}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {result.theoreticalNotes.definition}
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors min-h-[38px]"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors min-h-[38px] hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* 5-Tuple Summary (Original vs Converted) */}
      {viewSection !== 'diagram' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original */}
          <div className="bg-[#222d3d] p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-400 border-b border-slate-700/60 pb-1.5 flex justify-between">
              <span>Input {result.originalAutomaton.type}: M = (Q, Σ, δ, q₀, F)</span>
              <span className="text-slate-500 font-normal">Original</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div><span className="text-slate-500">Q = </span>{`{${result.originalAutomaton.states.join(', ')}}`}</div>
              <div><span className="text-slate-500">Σ = </span>{`{${result.originalAutomaton.alphabet.join(', ')}}`}</div>
              <div><span className="text-slate-500">q₀ = </span>{result.originalAutomaton.initialState}</div>
              <div><span className="text-slate-500">F = </span>{`{${result.originalAutomaton.finalStates.join(', ')}}`}</div>
            </div>
          </div>

          {/* Converted */}
          <div className="bg-[#222d3d] p-4 rounded-xl border border-indigo-900/40 space-y-2">
            <div className="text-xs font-mono font-semibold text-indigo-300 border-b border-slate-700/60 pb-1.5 flex justify-between">
              <span>Result {result.convertedAutomaton.type}: M' = (Q', Σ, δ', q₀', F')</span>
              <span className="text-indigo-400 font-normal">Converted</span>
            </div>
            <div className="space-y-1 font-mono text-xs text-slate-300">
              <div><span className="text-slate-500">Q' = </span>{`{${result.convertedAutomaton.states.join(', ')}}`}</div>
              <div><span className="text-slate-500">Σ = </span>{`{${result.convertedAutomaton.alphabet.join(', ')}}`}</div>
              <div><span className="text-slate-500">q₀' = </span>{result.convertedAutomaton.initialState}</div>
              <div><span className="text-slate-500">F' = </span>{`{${result.convertedAutomaton.finalStates.join(', ')}}`}</div>
            </div>
          </div>
        </div>
      )}

      {/* State Diagram - show on all or diagram */}
      {(viewSection === 'all' || viewSection === 'diagram') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold">State Transition Graph</span>
            <div className="flex items-center gap-1 bg-[#222d3d] border border-slate-700/60 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveDiagramTab('converted')}
                className={`px-2.5 py-1.5 rounded-md text-xs transition-colors min-h-[34px] ${
                  activeDiagramTab === 'converted'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Converted {result.convertedAutomaton.type}
              </button>
              <button
                onClick={() => setActiveDiagramTab('original')}
                className={`px-2.5 py-1.5 rounded-md text-xs transition-colors min-h-[34px] ${
                  activeDiagramTab === 'original'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Original {result.originalAutomaton.type}
              </button>
            </div>
          </div>

          {activeDiagramTab === 'converted' ? (
            <AutomataDiagram
              automaton={result.convertedAutomaton}
              title={`${result.convertedAutomaton.type} Graph`}
            />
          ) : (
            <AutomataDiagram
              automaton={result.originalAutomaton}
              title={`${result.originalAutomaton.type} Graph`}
            />
          )}
        </div>
      )}

      {/* Step-by-Step Mathematical Calculations - show on all or solution */}
      {(viewSection === 'all' || viewSection === 'solution') && (
        <>
          <div className="text-xs font-mono font-semibold text-slate-300 border-b border-slate-700/60 pb-1">
            Derivation Steps
          </div>

          {result.steps.map(step => {
            const isCollapsed = !!collapsedSteps[step.stepNumber];

            return (
              <div
                key={step.stepNumber}
                className="rounded border border-slate-700/60 bg-[#222d3d] overflow-hidden"
              >
                <div
                  onClick={() => toggleStep(step.stepNumber)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/40 select-none border-b border-slate-700/60"
                >
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-bold">
                      Step {step.stepNumber}
                    </span>
                    <span className="text-xs font-semibold text-white">{step.title}</span>
                  </div>

                  <div className="text-slate-500">
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-4 space-y-3 bg-[#1a2535] text-xs">
                    <p className="text-slate-300 leading-relaxed font-sans">
                      {step.description}
                    </p>

                    {step.mathFormula && (
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-700/60 font-mono text-indigo-300 text-xs">
                        {step.mathFormula}
                      </div>
                    )}

                    {step.details && step.details.length > 0 && (
                      <div className="bg-[#222d3d] rounded border border-slate-700/60 p-3 space-y-1 font-mono text-slate-300 max-h-72 overflow-y-auto">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 py-0.5">
                            <span className="text-slate-500">›</span>
                            <span className="whitespace-pre-wrap">{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.tableSnapshot && (
                      <div className="overflow-x-auto rounded border border-slate-700/60 bg-[#222d3d]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-700/60 bg-slate-900 font-mono text-slate-300">
                              {step.tableSnapshot.headers.map((h, i) => (
                                <th
                                  key={i}
                                  className={`py-2 px-3 border-r border-slate-700/60 last:border-none ${
                                    i > 0 ? 'text-center' : ''
                                  }`}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 font-mono">
                            {step.tableSnapshot.rows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-800/30">
                                <td className="py-1.5 px-3 font-semibold text-slate-200 border-r border-slate-700/60 sticky left-0 bg-[#222d3d] z-10">
                                  <span className="text-slate-500 mr-1.5">
                                    {row.isInitial ? '→' : ''}{row.isFinal ? '*' : ''}
                                  </span>
                                  <span>{row.state}</span>
                                </td>
                                {row.cells.map((c, ci) => (
                                  <td
                                    key={ci}
                                    className={`py-1.5 px-3 text-center border-r border-slate-700/60 last:border-none ${
                                      c === '∅' ? 'text-slate-600' : 'text-slate-200'
                                    }`}
                                  >
                                    {c}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Exam Notes */}
          <div className="p-4 rounded border border-slate-700/60 bg-[#222d3d] space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-300 border-b border-slate-700/60 pb-1.5">
              Examination Notes & Algorithm Properties
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-mono text-slate-400 font-semibold block mb-1">Key Principles:</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {result.theoreticalNotes.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-mono text-slate-400 font-semibold block mb-1">Marking Guide:</span>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  {result.theoreticalNotes.examTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
