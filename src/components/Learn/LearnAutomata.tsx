import React, { useState } from 'react';
import type { QuizQuestion } from '../../types/automata';
import {
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'How many transitions does a state in a DFA have for each symbol in the input alphabet?',
    options: [
      'At most one (can be undefined)',
      'Exactly one deterministic transition',
      'Zero, one, or multiple transitions',
      'At least two transitions',
    ],
    correctIndex: 1,
    explanation:
      'In a formal DFA, the transition function δ: Q × Σ → Q is a total function, meaning for every state and every alphabet symbol, there is strictly and exactly one transition.',
    topic: 'DFA',
  },
  {
    id: 2,
    question: 'If an NFA has n states, what is the theoretical maximum number of states in its equivalent DFA?',
    options: ['n', 'n²', '2ⁿ', 'n!'],
    correctIndex: 2,
    explanation:
      'In the Rabin-Scott Subset Construction, each state of the DFA is a subset of the states of the NFA (i.e. element of the power set 2^Q). Hence, at most 2ⁿ states can exist.',
    topic: 'Conversion',
  },
  {
    id: 3,
    question: 'What is the ε-closure of a state q?',
    options: [
      'The set of states reachable from q by consuming at least one input symbol',
      'The set of states reachable from q by reading zero or more ε (epsilon) transitions',
      'Only the states that directly follow q on symbol 0',
      'The set of all non-accepting states',
    ],
    correctIndex: 1,
    explanation:
      'ε-closure(q) is defined as { p ∈ Q | q ⟶^ε* p }, which includes state q itself (0 ε-steps) and all states reachable purely via ε-transitions.',
    topic: 'ENFA',
  },
  {
    id: 4,
    question: 'When is a subset state S in a converted DFA designated as a final (accepting) state?',
    options: [
      'If every state in S is a final state in the NFA',
      'If S contains at least one final state from the original NFA',
      'Only if S is the initial state',
      'If S contains no dead states',
    ],
    correctIndex: 1,
    explanation:
      'A DFA state S is accepting if S ∩ F_NFA ≠ ∅. Since an NFA accepts if ANY branch reaches an accepting state, a subset state only needs to contain at least one accepting state.',
    topic: 'Conversion',
  },
  {
    id: 5,
    question: 'What is a "Dead State" (or Trap State) in automata theory?',
    options: [
      'The initial state of an automaton',
      'A non-accepting state from which no final state can ever be reached',
      'Any state that has an ε-transition',
      'A state that accepts all strings',
    ],
    correctIndex: 1,
    explanation:
      'A dead state is a non-final state from which there is no directed path to any accepting state. A trap state typically loops to itself on all alphabet symbols.',
    topic: 'DFA',
  },
  {
    id: 6,
    question: 'Do NFAs have greater computational expressive power than DFAs?',
    options: [
      'Yes, NFAs can accept non-regular context-free languages',
      'No, DFAs and NFAs accept the exact same class of languages (Regular Languages)',
      'Yes, because NFAs can guess non-deterministically',
      'It depends on whether epsilon moves are permitted',
    ],
    correctIndex: 1,
    explanation:
      'DFAs, NFAs, and ε-NFAs are computationally equivalent. Every NFA can be converted to an equivalent DFA using subset construction, so they both recognize exactly the Regular Languages.',
    topic: 'Conversion',
  },
];

export const LearnAutomata: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'cheatSheet' | 'quiz'>('notes');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  const score = Object.entries(userAnswers).filter(
    ([qId, ans]) => QUIZ_QUESTIONS.find(q => q.id === Number(qId))?.correctIndex === ans
  ).length;

  return (
    <div className="space-y-5 text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div>
          <h2 className="text-lg font-mono font-bold text-white">Automata Theory Reference Notes</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Formal definitions, conversion theorems, and university exam revision points.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#222d3d] p-0.5 rounded border border-slate-700/60 font-mono text-xs">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'notes' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Definitions
          </button>
          <button
            onClick={() => setActiveTab('cheatSheet')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'cheatSheet' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comparison Matrix
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'quiz' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Practice Questions
          </button>
        </div>
      </div>

      {/* TAB 1: CURRICULUM NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* DFA */}
            <div className="p-4 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
              <div className="font-bold text-slate-200 border-b border-slate-700/60 pb-1 flex justify-between">
                <span>Deterministic FA (DFA)</span>
                <span className="text-cyan-400">δ: Q × Σ → Q</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                For every state q ∈ Q and input symbol a ∈ Σ, there is strictly and uniquely one next state. No empty string (ε) transitions are permitted.
              </p>
              <ul className="text-slate-400 font-sans space-y-1 list-disc list-inside text-xs">
                <li>Deterministic execution (O(1) transition lookup)</li>
                <li>Transition table cells contain scalar states</li>
                <li>Accepts w if δ*(q₀, w) ∈ F</li>
              </ul>
            </div>

            {/* NFA */}
            <div className="p-4 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
              <div className="font-bold text-slate-200 border-b border-slate-700/60 pb-1 flex justify-between">
                <span>Non-Deterministic FA (NFA)</span>
                <span className="text-purple-400">δ: Q × Σ → 2^Q</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                A state can transition to zero, one, or multiple states on the same input symbol. The machine accepts if at least one computation path ends in an accepting state.
              </p>
              <ul className="text-slate-400 font-sans space-y-1 list-disc list-inside text-xs">
                <li>Allows non-deterministic branching</li>
                <li>Transition table cells contain state subsets</li>
                <li>Can be converted to DFA via Subset Construction</li>
              </ul>
            </div>

            {/* ε-NFA */}
            <div className="p-4 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
              <div className="font-bold text-slate-200 border-b border-slate-700/60 pb-1 flex justify-between">
                <span>ε-NFA (Epsilon Transitions)</span>
                <span className="text-indigo-400">δ: Q × (Σ ∪ {'{ε}'}) → 2^Q</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                Extends NFA by allowing state changes without consuming an input symbol (spontaneous ε transitions).
              </p>
              <ul className="text-slate-400 font-sans space-y-1 list-disc list-inside text-xs">
                <li>Requires ε-closure computation</li>
                <li>Directly used in Thompson's regex construction</li>
                <li>Equivalent in expressive power to DFA & NFA</li>
              </ul>
            </div>
          </div>

          {/* Deep Dives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
              <div className="font-bold text-slate-200 border-b border-slate-700/60 pb-1">
                Epsilon Closure: ε-closure(q)
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                The set of all states reachable from q by following 0 or more ε transitions:
              </p>
              <div className="p-2 rounded bg-[#1a2535] border border-slate-700/60 text-indigo-300 font-mono">
                ε-closure(q) = {'{'} p ∈ Q | q ⟶^ε* p {'}'}
              </div>
              <div className="text-slate-400 font-sans space-y-0.5">
                <div>• State q is always in its own ε-closure: q ∈ ε-closure(q).</div>
                <div>• For a set S: ε-closure(S) = ⋃ {'{'} ε-closure(s) | s ∈ S {'}'}.</div>
              </div>
            </div>

            <div className="p-4 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
              <div className="font-bold text-slate-200 border-b border-slate-700/60 pb-1">
                Subset Construction Algorithm
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                Converts NFA M = (Q, Σ, δ, q₀, F) to equivalent DFA M' = (Q', Σ, δ', q₀', F'):
              </p>
              <div className="p-2 rounded bg-[#1a2535] border border-slate-700/60 text-cyan-300 font-mono">
                δ'(S, a) = ⋃_{'{p ∈ S}'} δ(p, a)
              </div>
              <div className="text-slate-400 font-sans space-y-0.5">
                <div>• Initial DFA state: {'{q₀}'} (or ε-closure(q₀) for ε-NFA).</div>
                <div>• Final DFA states: Any subset S where S ∩ F ≠ ∅.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPARISON MATRIX */}
      {activeTab === 'cheatSheet' && (
        <div className="rounded border border-slate-700/60 bg-[#222d3d] overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900 text-slate-300">
                <th className="py-2.5 px-3 border-r border-slate-700/60">Property</th>
                <th className="py-2.5 px-3 border-r border-slate-700/60 text-cyan-400">DFA</th>
                <th className="py-2.5 px-3 border-r border-slate-700/60 text-purple-400">NFA</th>
                <th className="py-2.5 px-3 text-indigo-400">ε-NFA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans text-slate-300 text-xs">
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-200 border-r border-slate-700/60">Transition Signature</td>
                <td className="py-2 px-3 font-mono border-r border-slate-700/60">δ: Q × Σ → Q</td>
                <td className="py-2 px-3 font-mono border-r border-slate-700/60">δ: Q × Σ → 2^Q</td>
                <td className="py-2 px-3 font-mono">δ: Q × (Σ ∪ {'{ε}'}) → 2^Q</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-200 border-r border-slate-700/60">Transitions per Symbol</td>
                <td className="py-2 px-3 border-r border-slate-700/60">Exactly 1</td>
                <td className="py-2 px-3 border-r border-slate-700/60">0, 1, or more</td>
                <td className="py-2 px-3">0, 1, or more</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-200 border-r border-slate-700/60">ε-Transitions</td>
                <td className="py-2 px-3 border-r border-slate-700/60 text-rose-400">No</td>
                <td className="py-2 px-3 border-r border-slate-700/60 text-rose-400">No</td>
                <td className="py-2 px-3 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-200 border-r border-slate-700/60">Max States from n-state NFA</td>
                <td className="py-2 px-3 border-r border-slate-700/60 font-mono">2ⁿ</td>
                <td className="py-2 px-3 border-r border-slate-700/60 font-mono">n</td>
                <td className="py-2 px-3 font-mono">n</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-semibold text-slate-200 border-r border-slate-700/60">Language Class</td>
                <td className="py-2 px-3 border-r border-slate-700/60">Regular Languages</td>
                <td className="py-2 px-3 border-r border-slate-700/60">Regular Languages</td>
                <td className="py-2 px-3">Regular Languages</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PRACTICE QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">6 Conceptual Questions</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetQuiz}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResults(true)}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Grade Quiz
              </button>
            </div>
          </div>

          {showResults && (
            <div className="p-3 rounded border border-indigo-900 bg-[#222d3d] text-xs font-mono flex items-center justify-between">
              <div>
                Score: <strong className="text-white">{score} / {QUIZ_QUESTIONS.length}</strong> ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
              </div>
            </div>
          )}

          <div className="space-y-3">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={q.id} className="p-3.5 rounded border border-slate-700/60 bg-[#222d3d] space-y-2">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-200">
                      {idx + 1}. {q.question}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {q.topic}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let style = 'bg-[#1a2535] border-slate-700/60 text-slate-300 hover:border-slate-700';

                      if (showResults) {
                        if (optIdx === q.correctIndex) {
                          style = 'bg-emerald-950/40 border-emerald-700 text-emerald-200';
                        } else if (isChosen && !isCorrect) {
                          style = 'bg-rose-950/40 border-rose-700 text-rose-200';
                        }
                      } else if (isChosen) {
                        style = 'bg-indigo-950/60 border-indigo-600 text-indigo-200 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-2 rounded border flex items-center justify-between transition-colors ${style}`}
                        >
                          <span>{opt}</span>
                          {showResults && optIdx === q.correctIndex && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          {showResults && isChosen && !isCorrect && (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-2.5 rounded bg-[#1a2535] border border-slate-700/60 text-[11px] text-slate-400 space-y-0.5 font-sans">
                      <strong className="text-slate-300 font-mono block">Explanation:</strong>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
