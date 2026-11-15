import type {
  Automaton,
  ConversionResult,
  StepLog,
} from '../types/automata';
import {
  EPSILON,
  EPSILON_ALIASES,
} from '../types/automata';

// Normalize symbol checks (handles ε, e, eps, etc.)
export function isEpsilon(symbol: string): boolean {
  return EPSILON_ALIASES.includes(symbol.trim()) || symbol.trim() === EPSILON;
}

// Normalize set to sorted array
export function normalizeSet(states: string[]): string[] {
  const unique = Array.from(new Set(states.map(s => s.trim()).filter(Boolean)));
  return unique.sort((a, b) => {
    // Try natural numerical sort if names follow pattern like q0, q1, q10
    const matchA = a.match(/^([a-zA-Z]+)(\d+)$/);
    const matchB = b.match(/^([a-zA-Z]+)(\d+)$/);
    if (matchA && matchB && matchA[1] === matchB[1]) {
      return parseInt(matchA[2], 10) - parseInt(matchB[2], 10);
    }
    return a.localeCompare(b);
  });
}

// Convert state array to set notation string: e.g. "{q0, q1}" or "∅"
export function formatSet(states: string[]): string {
  const norm = normalizeSet(states);
  if (norm.length === 0) return '∅';
  return `{${norm.join(', ')}}`;
}

// Generate canonical key for set of states
export function setKey(states: string[]): string {
  return normalizeSet(states).join('|');
}

// Parse set key or string back to array
export function keyToStates(key: string): string[] {
  if (!key || key === '∅') return [];
  return key.split('|').filter(Boolean);
}

// Check set equality
export function setsEqual(a: string[], b: string[]): boolean {
  const normA = normalizeSet(a);
  const normB = normalizeSet(b);
  if (normA.length !== normB.length) return false;
  return normA.every((val, idx) => val === normB[idx]);
}

// Check if set A contains any element of set B (intersection is non-empty)
export function hasIntersection(a: string[], b: string[]): boolean {
  const setB = new Set(b);
  return a.some(item => setB.has(item));
}

/**
 * Computes ε-closure of a single state q
 */
export function getEpsilonClosure(
  automaton: Automaton,
  state: string,
  traceLogs?: string[]
): string[] {
  const closure = new Set<string>([state]);
  const queue = [state];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const stateTransitions = automaton.transitions[current] || {};

    // Check all epsilon aliases
    for (const [sym, targets] of Object.entries(stateTransitions)) {
      if (isEpsilon(sym) && targets) {
        for (const target of targets) {
          if (!closure.has(target)) {
            closure.add(target);
            queue.push(target);
            if (traceLogs) {
              traceLogs.push(`From ${current} via ε → reached ${target}`);
            }
          }
        }
      }
    }
  }

  return normalizeSet(Array.from(closure));
}

/**
 * Computes ε-closure for a set of states S
 */
export function getSetEpsilonClosure(
  automaton: Automaton,
  states: string[]
): string[] {
  const resultSet = new Set<string>();
  for (const st of states) {
    const singleClosure = getEpsilonClosure(automaton, st);
    for (const c of singleClosure) {
      resultSet.add(c);
    }
  }
  return normalizeSet(Array.from(resultSet));
}

/**
 * Computes move(S, symbol) = union of δ(q, symbol) for all q in S
 */
export function computeMove(
  automaton: Automaton,
  states: string[],
  symbol: string
): string[] {
  const targets = new Set<string>();
  for (const st of states) {
    const stateTransitions = automaton.transitions[st] || {};
    // Match exact symbol or epsilon if checked
    for (const [sym, nextStates] of Object.entries(stateTransitions)) {
      if (sym === symbol && nextStates) {
        for (const target of nextStates) {
          targets.add(target);
        }
      }
    }
  }
  return normalizeSet(Array.from(targets));
}

/**
 * 1. DFA to NFA Conversion
 * Every DFA is by definition an NFA where every transition maps to a singleton set.
 */
export function convertDfaToNfa(dfa: Automaton): ConversionResult {
  const steps: StepLog[] = [];

  // Step 1: Definition & formal mapping
  steps.push({
    stepNumber: 1,
    title: 'Formal Mathematical Equivalence',
    description: 'Every Deterministic Finite Automaton (DFA) is inherently a Non-Deterministic Finite Automaton (NFA). In a DFA, the transition function is δ: Q × Σ → Q. In an NFA, the transition function is δ\': Q × Σ → 2^Q (the power set of Q).',
    mathFormula: 'δ\'(q, a) = { δ(q, a) }   ∀ q ∈ Q, a ∈ Σ',
    details: [
      `States (Q): {${dfa.states.join(', ')}}`,
      `Alphabet (Σ): {${dfa.alphabet.join(', ')}}`,
      `Initial State (q0): ${dfa.initialState}`,
      `Final States (F): {${dfa.finalStates.join(', ')}}`,
      'Every deterministic transition to a single state p is represented as the singleton set {p} in NFA notation.'
    ]
  });

  // Step 2: Mapping transitions
  const nfaTransitions: Record<string, Record<string, string[]>> = {};
  const transitionDetails: string[] = [];

  for (const state of dfa.states) {
    nfaTransitions[state] = {};
    for (const symbol of dfa.alphabet) {
      const dfaTarget = dfa.transitions[state]?.[symbol] || [];
      if (dfaTarget.length > 0) {
        nfaTransitions[state][symbol] = [dfaTarget[0]];
        transitionDetails.push(`δ'(${state}, ${symbol}) = {${dfaTarget[0]}} (from DFA transition δ(${state}, ${symbol}) = ${dfaTarget[0]})`);
      } else {
        nfaTransitions[state][symbol] = [];
        transitionDetails.push(`δ'(${state}, ${symbol}) = ∅ (no transition defined)`);
      }
    }
  }

  steps.push({
    stepNumber: 2,
    title: 'Transition Function Mapping (Singleton Sets)',
    description: 'Each deterministic state transition is expressed as a singleton set in the NFA transition table.',
    details: transitionDetails,
    tableSnapshot: {
      headers: ['State', ...dfa.alphabet],
      rows: dfa.states.map(state => ({
        state,
        cells: dfa.alphabet.map(sym => {
          const targets = nfaTransitions[state]?.[sym] || [];
          return targets.length > 0 ? `{${targets.join(', ')}}` : '∅';
        }),
        isInitial: state === dfa.initialState,
        isFinal: dfa.finalStates.includes(state),
      }))
    }
  });

  const convertedAutomaton: Automaton = {
    name: `${dfa.name || 'Automaton'} (Converted NFA)`,
    type: 'NFA',
    states: [...dfa.states],
    alphabet: [...dfa.alphabet],
    initialState: dfa.initialState,
    finalStates: [...dfa.finalStates],
    transitions: nfaTransitions,
  };

  return {
    mode: 'DFA_TO_NFA',
    title: 'DFA to NFA Conversion',
    originalAutomaton: dfa,
    convertedAutomaton,
    steps,
    reachableStates: [...dfa.states],
    unreachableStates: [],
    deadStates: [],
    trapStates: [],
    theoreticalNotes: {
      definition: 'A DFA is a 5-tuple (Q, Σ, δ, q0, F) where δ is a total function Q × Σ → Q. An NFA maps Q × Σ → 2^Q.',
      algorithmName: 'Trivial Inclusion / Embedding Algorithm',
      keyPoints: [
        'A DFA is a special case of an NFA where |δ(q, a)| = 1 for all states and symbols.',
        'The languages accepted by DFAs and NFAs are identical (Regular Languages).',
        'No states need to be added or eliminated during DFA to NFA conversion.'
      ],
      examTips: [
        'In university examinations, write the formal 5-tuple for both DFA and NFA.',
        'State clearly: "Since {p} ∈ 2^Q, every deterministic transition δ(q, a) = p directly maps to δ\'(q, a) = {p}."',
        'Always present the final NFA transition table using set notation like {q0} rather than scalar q0.'
      ]
    }
  };
}

/**
 * 2. NFA to DFA Conversion (Subset Construction / Powerset Construction)
 */
export function convertNfaToDfa(nfa: Automaton): ConversionResult {
  const steps: StepLog[] = [];
  const alphabet = nfa.alphabet.filter(s => !isEpsilon(s));

  steps.push({
    stepNumber: 1,
    title: 'Initial State Selection',
    description: 'In the Subset Construction (Powerset Construction) algorithm, the initial state of the DFA is the set containing only the initial state of the NFA.',
    mathFormula: 'q0\' = { q0 }',
    details: [
      `Original NFA initial state: ${nfa.initialState}`,
      `DFA initial state: {${nfa.initialState}}`,
      `Total possible states in powerset 2^|Q| = 2^${nfa.states.length} = ${Math.pow(2, nfa.states.length)} states.`
    ]
  });

  const initialSubset = [nfa.initialState];
  const initialKey = setKey(initialSubset);

  // Queue of subsets to explore
  const queue: string[][] = [initialSubset];
  const visitedKeys = new Set<string>([initialKey]);
  const reachableSubsets: string[][] = [initialSubset];

  // Mapping from canonical key to a clean display name
  const stateLabels: Record<string, string> = {
    [initialKey]: formatSet(initialSubset),
  };

  // State letter aliases for clean reading (A, B, C...)
  const letterAliases: Record<string, string> = {
    [initialKey]: 'A',
  };
  let aliasCounter = 1;

  // DFA transition table: transitions[subsetKey][symbol] = targetKey
  const dfaTransitionsMap: Record<string, Record<string, string>> = {};
  const stepCalculations: string[] = [];

  let hasDeadState = false;
  const deadKey = 'EMPTY_DEAD_STATE';

  while (queue.length > 0) {
    const currentSubset = queue.shift()!;
    const currentKey = setKey(currentSubset);
    const currentLabel = formatSet(currentSubset);
    const currentAlias = letterAliases[currentKey] || `S${aliasCounter++}`;
    letterAliases[currentKey] = currentAlias;

    dfaTransitionsMap[currentKey] = {};

    for (const sym of alphabet) {
      // Calculate union of delta(p, sym) for all p in currentSubset
      const moves: string[] = [];
      const perStateMoves: string[] = [];

      for (const st of currentSubset) {
        const nextStates = nfa.transitions[st]?.[sym] || [];
        moves.push(...nextStates);
        perStateMoves.push(`δ(${st}, ${sym}) = ${nextStates.length > 0 ? `{${nextStates.join(', ')}}` : '∅'}`);
      }

      const targetSubset = normalizeSet(moves);
      const targetKey = setKey(targetSubset);
      const targetLabel = formatSet(targetSubset);

      if (targetSubset.length === 0) {
        hasDeadState = true;
        dfaTransitionsMap[currentKey][sym] = deadKey;
        stepCalculations.push(
          `δ'(${currentLabel}, ${sym}) = ${perStateMoves.join(' ∪ ')} = ∅ [Dead State]`
        );
      } else {
        dfaTransitionsMap[currentKey][sym] = targetKey;
        stateLabels[targetKey] = targetLabel;

        if (!letterAliases[targetKey]) {
          letterAliases[targetKey] = String.fromCharCode(65 + (aliasCounter % 26)) + (aliasCounter >= 26 ? Math.floor(aliasCounter / 26) : '');
          aliasCounter++;
        }

        stepCalculations.push(
          `δ'(${currentLabel}, ${sym}) = ${perStateMoves.join(' ∪ ')} = ${targetLabel}`
        );

        if (!visitedKeys.has(targetKey)) {
          visitedKeys.add(targetKey);
          queue.push(targetSubset);
          reachableSubsets.push(targetSubset);
        }
      }
    }
  }

  // If a dead state exists, add its transitions (self loops on all symbols)
  if (hasDeadState) {
    dfaTransitionsMap[deadKey] = {};
    stateLabels[deadKey] = '∅';
    letterAliases[deadKey] = 'Trap';
    for (const sym of alphabet) {
      dfaTransitionsMap[deadKey][sym] = deadKey;
    }
  }

  steps.push({
    stepNumber: 2,
    title: 'Subset Transition Computation',
    description: 'For each discovered subset state S and each input symbol a ∈ Σ, we compute the union of moves: δ\'(S, a) = ⋃ { δ(q, a) | q ∈ S }.',
    mathFormula: "δ_{DFA}(S, a) = ⋃_{p ∈ S} δ_{NFA}(p, a)",
    details: stepCalculations
  });

  // Identify final states
  const finalSubsets: string[][] = [];
  const finalStateKeys = new Set<string>();

  for (const subset of reachableSubsets) {
    if (hasIntersection(subset, nfa.finalStates)) {
      finalSubsets.push(subset);
      finalStateKeys.add(setKey(subset));
    }
  }

  steps.push({
    stepNumber: 3,
    title: 'Accepting (Final) States Identification',
    description: 'Any DFA subset state that contains at least one final state of the original NFA is designated as an accepting state in the DFA.',
    mathFormula: "F_{DFA} = { S ⊆ Q | S ∩ F_{NFA} ≠ ∅ }",
    details: [
      `Original NFA final states: {${nfa.finalStates.join(', ')}}`,
      ...finalSubsets.map(
        s => `${formatSet(s)} is FINAL because it contains ${s.filter(st => nfa.finalStates.includes(st)).join(', ')}`
      )
    ]
  });

  // Construct final converted automaton
  const allResultKeys = Array.from(visitedKeys);
  if (hasDeadState) {
    allResultKeys.push(deadKey);
  }

  const resultStates = allResultKeys.map(k => stateLabels[k]);
  const resultInitialState = formatSet(initialSubset);
  const resultFinalStates = Array.from(finalStateKeys).map(k => stateLabels[k]);

  const convertedTransitions: Record<string, Record<string, string[]>> = {};
  for (const k of allResultKeys) {
    const fromLabel = stateLabels[k];
    convertedTransitions[fromLabel] = {};
    for (const sym of alphabet) {
      const targetK = dfaTransitionsMap[k]?.[sym];
      if (targetK && stateLabels[targetK]) {
        convertedTransitions[fromLabel][sym] = [stateLabels[targetK]];
      } else {
        convertedTransitions[fromLabel][sym] = [];
      }
    }
  }

  // Table snapshot step
  steps.push({
    stepNumber: 4,
    title: 'Final DFA Transition Table',
    description: 'The complete deterministic transition table obtained through subset construction, omitting unreachable combinations.',
    tableSnapshot: {
      headers: ['State (Subset)', 'Alias', ...alphabet],
      rows: allResultKeys.map(k => ({
        state: stateLabels[k],
        cells: [
          letterAliases[k] || '',
          ...alphabet.map(sym => {
            const targetK = dfaTransitionsMap[k]?.[sym];
            return targetK ? stateLabels[targetK] : '∅';
          })
        ],
        isInitial: k === initialKey,
        isFinal: finalStateKeys.has(k),
      }))
    }
  });

  const convertedAutomaton: Automaton = {
    name: `${nfa.name || 'NFA'} (Converted DFA)`,
    type: 'DFA',
    states: resultStates,
    alphabet: [...alphabet],
    initialState: resultInitialState,
    finalStates: resultFinalStates,
    transitions: convertedTransitions,
  };

  const totalPowersetSize = Math.pow(2, nfa.states.length);
  const unreachableCount = Math.max(0, totalPowersetSize - reachableSubsets.length);

  return {
    mode: 'NFA_TO_DFA',
    title: 'NFA to DFA Conversion (Subset Construction)',
    originalAutomaton: nfa,
    convertedAutomaton,
    steps,
    stateMapping: stateLabels,
    reachableStates: resultStates,
    unreachableStates: unreachableCount > 0 ? [`${unreachableCount} theoretical subsets unreachable from {${nfa.initialState}}`] : [],
    deadStates: hasDeadState ? ['∅'] : [],
    trapStates: hasDeadState ? ['∅'] : [],
    theoreticalNotes: {
      definition: 'The subset construction method (also known as powerset construction) converts any NFA to an equivalent DFA.',
      algorithmName: 'Rabin-Scott Subset Construction Algorithm',
      keyPoints: [
        `If the NFA has n states, the DFA can have at most 2^n states (${totalPowersetSize} states here).`,
        `In practice, only reachable states (${reachableSubsets.length} states) are created, saving exponential complexity.`,
        'Every final state of the DFA contains at least one accepting state of the original NFA.',
        hasDeadState ? 'Empty moves ∅ result in a Trap/Dead state to maintain DFA total transition property.' : 'All transitions lead to valid active subsets.'
      ],
      examTips: [
        'Always start with the singleton set containing the start state {q0}.',
        'List out the union of δ(q, a) explicitly for full university examination marks.',
        'Circle or highlight final states: any subset with an original final state is an accepting state.',
        'Mention: "Unreachable subsets from 2^Q are omitted because they cannot be reached from the initial state."'
      ]
    }
  };
}

/**
 * 3. ε-NFA to DFA Conversion (Epsilon Closure + Subset Construction)
 */
export function convertEnfaToDfa(enfa: Automaton): ConversionResult {
  const steps: StepLog[] = [];
  const alphabet = enfa.alphabet.filter(s => !isEpsilon(s));

  // Step 1: Compute ε-closure for each individual state
  const epsilonClosures: Record<string, string[]> = {};
  const closureDetails: string[] = [];

  for (const st of enfa.states) {
    const trace: string[] = [];
    const closure = getEpsilonClosure(enfa, st, trace);
    epsilonClosures[st] = closure;
    closureDetails.push(
      `ε-closure(${st}) = {${closure.join(', ')}}${trace.length > 0 ? ` (Path: ${trace.join(', ')})` : ''}`
    );
  }

  steps.push({
    stepNumber: 1,
    title: 'Compute Epsilon (ε) Closures for All States',
    description: 'The ε-closure of a state q is the set of all states reachable from q by following zero or more ε-transitions.',
    mathFormula: 'ε-closure(q) = { p ∈ Q | q ⟶^ε* p }',
    details: closureDetails
  });

  // Step 2: Determine initial state of DFA = ε-closure(q0)
  const initialSubset = epsilonClosures[enfa.initialState] || [enfa.initialState];
  const initialKey = setKey(initialSubset);

  steps.push({
    stepNumber: 2,
    title: 'Initial State of DFA',
    description: 'The initial state of the DFA is the ε-closure of the initial state of the ε-NFA.',
    mathFormula: 'q0\' = ε-closure(q0)',
    details: [
      `Original initial state: ${enfa.initialState}`,
      `DFA initial state S0 = ε-closure(${enfa.initialState}) = ${formatSet(initialSubset)}`
    ]
  });

  // Step 3: Subset construction with ε-closure
  const queue: string[][] = [initialSubset];
  const visitedKeys = new Set<string>([initialKey]);
  const reachableSubsets: string[][] = [initialSubset];

  const stateLabels: Record<string, string> = {
    [initialKey]: formatSet(initialSubset),
  };
  const letterAliases: Record<string, string> = {
    [initialKey]: 'A',
  };
  let aliasCounter = 1;

  const dfaTransitionsMap: Record<string, Record<string, string>> = {};
  const subsetStepDetails: string[] = [];
  let hasDeadState = false;
  const deadKey = 'EMPTY_DEAD_STATE';

  while (queue.length > 0) {
    const currentSubset = queue.shift()!;
    const currentKey = setKey(currentSubset);
    const currentLabel = formatSet(currentSubset);

    dfaTransitionsMap[currentKey] = {};

    for (const sym of alphabet) {
      // Step A: move(currentSubset, sym)
      const directMoves = computeMove(enfa, currentSubset, sym);

      // Step B: epsilon closure of move
      const targetSubset = getSetEpsilonClosure(enfa, directMoves);
      const targetKey = setKey(targetSubset);
      const targetLabel = formatSet(targetSubset);

      const moveStr = formatSet(directMoves);

      if (targetSubset.length === 0) {
        hasDeadState = true;
        dfaTransitionsMap[currentKey][sym] = deadKey;
        subsetStepDetails.push(
          `• δ'(${currentLabel}, ${sym}) = ε-closure(move(${currentLabel}, ${sym})) = ε-closure(${moveStr}) = ∅ [Dead State]`
        );
      } else {
        dfaTransitionsMap[currentKey][sym] = targetKey;
        stateLabels[targetKey] = targetLabel;

        if (!letterAliases[targetKey]) {
          letterAliases[targetKey] = String.fromCharCode(65 + (aliasCounter % 26)) + (aliasCounter >= 26 ? Math.floor(aliasCounter / 26) : '');
          aliasCounter++;
        }

        subsetStepDetails.push(
          `• δ'(${currentLabel}, ${sym}) = ε-closure(move(${currentLabel}, ${sym})) = ε-closure(${moveStr}) = ${targetLabel}`
        );

        if (!visitedKeys.has(targetKey)) {
          visitedKeys.add(targetKey);
          queue.push(targetSubset);
          reachableSubsets.push(targetSubset);
        }
      }
    }
  }

  // Handle dead state
  if (hasDeadState) {
    dfaTransitionsMap[deadKey] = {};
    stateLabels[deadKey] = '∅';
    letterAliases[deadKey] = 'Trap';
    for (const sym of alphabet) {
      dfaTransitionsMap[deadKey][sym] = deadKey;
    }
  }

  steps.push({
    stepNumber: 3,
    title: 'Calculate Moves & Epsilon Closures',
    description: 'For each subset state and each symbol, compute the direct transitions, then take the ε-closure of the resulting states: δ\'(S, a) = ε-closure(move(S, a)).',
    mathFormula: "δ_{DFA}(S, a) = ε\\text{-closure}\\left( \\bigcup_{p ∈ S} δ(p, a) \\right)",
    details: subsetStepDetails
  });

  // Step 4: Final states
  const finalSubsets: string[][] = [];
  const finalStateKeys = new Set<string>();

  for (const subset of reachableSubsets) {
    if (hasIntersection(subset, enfa.finalStates)) {
      finalSubsets.push(subset);
      finalStateKeys.add(setKey(subset));
    }
  }

  steps.push({
    stepNumber: 4,
    title: 'Designate DFA Final States',
    description: 'Any DFA state whose subset contains at least one accepting state of the original ε-NFA becomes an accepting state.',
    mathFormula: "F_{DFA} = { S | S ∩ F_{ε-NFA} ≠ ∅ }",
    details: [
      `Original ε-NFA final states: {${enfa.finalStates.join(', ')}}`,
      ...finalSubsets.map(
        s => `${formatSet(s)} is FINAL because it contains final state(s): ${s.filter(st => enfa.finalStates.includes(st)).join(', ')}`
      )
    ]
  });

  // Step 5: Transition Table
  const allResultKeys = Array.from(visitedKeys);
  if (hasDeadState) {
    allResultKeys.push(deadKey);
  }

  const resultStates = allResultKeys.map(k => stateLabels[k]);
  const resultInitialState = formatSet(initialSubset);
  const resultFinalStates = Array.from(finalStateKeys).map(k => stateLabels[k]);

  const convertedTransitions: Record<string, Record<string, string[]>> = {};
  for (const k of allResultKeys) {
    const fromLabel = stateLabels[k];
    convertedTransitions[fromLabel] = {};
    for (const sym of alphabet) {
      const targetK = dfaTransitionsMap[k]?.[sym];
      if (targetK && stateLabels[targetK]) {
        convertedTransitions[fromLabel][sym] = [stateLabels[targetK]];
      } else {
        convertedTransitions[fromLabel][sym] = [];
      }
    }
  }

  steps.push({
    stepNumber: 5,
    title: 'Resulting DFA Transition Table',
    description: 'The final deterministic transition table with all ε-transitions successfully eliminated and reachable states mapped.',
    tableSnapshot: {
      headers: ['DFA State', 'Alias', ...alphabet],
      rows: allResultKeys.map(k => ({
        state: stateLabels[k],
        cells: [
          letterAliases[k] || '',
          ...alphabet.map(sym => {
            const targetK = dfaTransitionsMap[k]?.[sym];
            return targetK ? stateLabels[targetK] : '∅';
          })
        ],
        isInitial: k === initialKey,
        isFinal: finalStateKeys.has(k),
      }))
    }
  });

  const convertedAutomaton: Automaton = {
    name: `${enfa.name || 'ε-NFA'} (Converted DFA)`,
    type: 'DFA',
    states: resultStates,
    alphabet: [...alphabet],
    initialState: resultInitialState,
    finalStates: resultFinalStates,
    transitions: convertedTransitions,
  };

  return {
    mode: 'ENFA_TO_DFA',
    title: 'ε-NFA to DFA Conversion',
    originalAutomaton: enfa,
    convertedAutomaton,
    steps,
    stateMapping: stateLabels,
    epsilonClosures,
    reachableStates: resultStates,
    unreachableStates: [],
    deadStates: hasDeadState ? ['∅'] : [],
    trapStates: hasDeadState ? ['∅'] : [],
    theoreticalNotes: {
      definition: 'An ε-NFA allows state transitions without reading an input symbol (empty string ε transitions).',
      algorithmName: 'Epsilon-Closure Subset Construction Algorithm',
      keyPoints: [
        'Always start with ε-closure(q0) as the initial DFA state.',
        'At each step, calculate move(S, a), then calculate ε-closure of the move result.',
        'Any subset containing an original final state is an accepting state.',
        'This proves ε-NFAs, NFAs, and DFAs all have equivalent computational power.'
      ],
      examTips: [
        'Step 1 must be listing ε-closure for every single state in the problem.',
        'Write out move(S, a) before taking the ε-closure so examiners see both intermediate steps.',
        'Clearly indicate that ε is NOT a symbol in the alphabet of the resulting DFA.'
      ]
    }
  };
}

/**
 * 4. ε-NFA to NFA Conversion (Epsilon Elimination)
 */
export function convertEnfaToNfa(enfa: Automaton): ConversionResult {
  const steps: StepLog[] = [];
  const alphabet = enfa.alphabet.filter(s => !isEpsilon(s));

  // Step 1: Compute ε-closure for each state
  const epsilonClosures: Record<string, string[]> = {};
  const closureDetails: string[] = [];

  for (const st of enfa.states) {
    const closure = getEpsilonClosure(enfa, st);
    epsilonClosures[st] = closure;
    closureDetails.push(`ε-closure(${st}) = {${closure.join(', ')}}`);
  }

  steps.push({
    stepNumber: 1,
    title: 'Calculate ε-closure for All States',
    description: 'Find the set of all states reachable from each state via zero or more ε-transitions.',
    mathFormula: 'ε-closure(q) = { p ∈ Q | q ⟶^ε* p }',
    details: closureDetails
  });

  // Step 2: Calculate new transition function δ'(q, a) = ε-closure(move(ε-closure(q), a))
  const nfaTransitions: Record<string, Record<string, string[]>> = {};
  const transitionCalculations: string[] = [];

  for (const st of enfa.states) {
    nfaTransitions[st] = {};
    const stClosure = epsilonClosures[st] || [st];

    for (const sym of alphabet) {
      // 1. move(ε-closure(q), a)
      const directMoves = computeMove(enfa, stClosure, sym);
      // 2. ε-closure(move)
      const finalTargets = getSetEpsilonClosure(enfa, directMoves);

      nfaTransitions[st][sym] = finalTargets;

      transitionCalculations.push(
        `δ'(${st}, ${sym}) = ε-closure(move(ε-closure(${st}), ${sym}))\n` +
        `  = ε-closure(move({${stClosure.join(', ')}}, ${sym}))\n` +
        `  = ε-closure({${directMoves.join(', ')}})\n` +
        `  = {${finalTargets.length > 0 ? finalTargets.join(', ') : '∅'}}`
      );
    }
  }

  steps.push({
    stepNumber: 2,
    title: 'Compute New Transition Function δ\'(q, a)',
    description: 'For each state q ∈ Q and symbol a ∈ Σ, δ\'(q, a) = ε-closure(move(ε-closure(q), a)).',
    mathFormula: "δ'(q, a) = ε\\text{-closure}(\\text{move}(ε\\text{-closure}(q), a))",
    details: transitionCalculations
  });

  // Step 3: Determine new final states
  // F' = { q ∈ Q | ε-closure(q) ∩ F ≠ ∅ }
  const newFinalStates: string[] = [];
  const finalStateDetails: string[] = [];

  for (const st of enfa.states) {
    const stClosure = epsilonClosures[st] || [st];
    const isFinal = hasIntersection(stClosure, enfa.finalStates);
    if (isFinal) {
      newFinalStates.push(st);
      finalStateDetails.push(
        `${st} ∈ F' because ε-closure(${st}) = {${stClosure.join(', ')}} contains original final state(s): ${stClosure.filter(s => enfa.finalStates.includes(s)).join(', ')}`
      );
    } else {
      finalStateDetails.push(
        `${st} ∉ F' because ε-closure(${st}) does not contain any original final state.`
      );
    }
  }

  steps.push({
    stepNumber: 3,
    title: 'Determine New Set of Final States (F\')',
    description: 'A state q is accepting in the new NFA if its ε-closure contains at least one accepting state of the original ε-NFA.',
    mathFormula: "F' = { q ∈ Q | ε\\text{-closure}(q) ∩ F ≠ ∅ }",
    details: finalStateDetails
  });

  // Step 4: Final NFA transition table snapshot
  steps.push({
    stepNumber: 4,
    title: 'Final NFA Transition Table (Without ε)',
    description: 'The resulting NFA retains the same state set Q, but has all ε-transitions removed and transitions bypass empty moves.',
    tableSnapshot: {
      headers: ['State', ...alphabet],
      rows: enfa.states.map(state => ({
        state,
        cells: alphabet.map(sym => {
          const targets = nfaTransitions[state]?.[sym] || [];
          return targets.length > 0 ? `{${targets.join(', ')}}` : '∅';
        }),
        isInitial: state === enfa.initialState,
        isFinal: newFinalStates.includes(state),
      }))
    }
  });

  const convertedAutomaton: Automaton = {
    name: `${enfa.name || 'ε-NFA'} (Converted NFA without ε)`,
    type: 'NFA',
    states: [...enfa.states],
    alphabet: [...alphabet],
    initialState: enfa.initialState,
    finalStates: newFinalStates,
    transitions: nfaTransitions,
  };

  return {
    mode: 'ENFA_TO_NFA',
    title: 'ε-NFA to NFA Conversion (Epsilon Elimination)',
    originalAutomaton: enfa,
    convertedAutomaton,
    steps,
    epsilonClosures,
    reachableStates: [...enfa.states],
    unreachableStates: [],
    deadStates: [],
    trapStates: [],
    theoreticalNotes: {
      definition: 'Epsilon elimination transforms an ε-NFA into an equivalent standard NFA over the same set of states without any ε-moves.',
      algorithmName: 'Epsilon Elimination Algorithm',
      keyPoints: [
        'The state set Q remains the same as the original automaton.',
        'Transitions directly capture what can be reached after any initial ε-moves followed by a symbol move and subsequent ε-moves.',
        'The initial state q0 becomes a final state if ε-closure(q0) contains any original final state.'
      ],
      examTips: [
        'Write out the 3 components for each transition: ε-closure(q) -> move with symbol -> ε-closure of result.',
        'Double check if q0 must be made final: if ε-closure(q0) ∩ F ≠ ∅, q0 is ALWAYS in F\'.',
        'Ensure the final table has NO ε column.'
      ]
    }
  };
}

/**
 * 5. DFA Minimization (Table-Filling / Myhill-Nerode Equivalence Algorithm)
 */
export function minimizeDfa(dfa: Automaton): ConversionResult {
  const steps: StepLog[] = [];
  const alphabet = dfa.alphabet.filter(s => !isEpsilon(s));

  // Step 1: Reachability analysis
  const reachable = new Set<string>();
  const queue = [dfa.initialState];
  reachable.add(dfa.initialState);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const sym of alphabet) {
      const targets = dfa.transitions[current]?.[sym] || [];
      for (const t of targets) {
        if (!reachable.has(t) && dfa.states.includes(t)) {
          reachable.add(t);
          queue.push(t);
        }
      }
    }
  }

  const reachableStates = dfa.states.filter(s => reachable.has(s));
  const unreachableStates = dfa.states.filter(s => !reachable.has(s));

  steps.push({
    stepNumber: 1,
    title: 'Elimination of Unreachable States',
    description: 'Any state that cannot be reached from the initial state q0 does not affect the language recognized by the DFA and is removed before minimization.',
    mathFormula: 'Q_{reachable} = { q ∈ Q | ∃ w ∈ Σ^* : δ^*(q_0, w) = q }',
    details: [
      `Initial State: ${dfa.initialState}`,
      `Reachable States: {${reachableStates.join(', ')}}`,
      unreachableStates.length > 0
        ? `Unreachable States Removed: {${unreachableStates.join(', ')}}`
        : 'All states are reachable from initial state (no states discarded).'
    ]
  });

  // Step 2: 0-Equivalence / Initial Partition (F vs Q \ F)
  const finalSet = new Set(dfa.finalStates.filter(s => reachable.has(s)));
  const nonFinalStates = reachableStates.filter(s => !finalSet.has(s));
  const finalStates = reachableStates.filter(s => finalSet.has(s));

  const pairKey = (a: string, b: string) => a < b ? `${a},${b}` : `${b},${a}`;
  const markedPairs = new Map<string, { reason: string }>();

  // Mark 0-distinguishable pairs (one final, one non-final)
  for (let i = 0; i < reachableStates.length; i++) {
    for (let j = i + 1; j < reachableStates.length; j++) {
      const p = reachableStates[i];
      const q = reachableStates[j];
      const pFinal = finalSet.has(p);
      const qFinal = finalSet.has(q);

      if ((pFinal && !qFinal) || (!pFinal && qFinal)) {
        markedPairs.set(pairKey(p, q), {
          reason: `0-distinguishable: one is accepting and one is non-accepting (ε distinguishes them)`
        });
      }
    }
  }

  steps.push({
    stepNumber: 2,
    title: 'Basis Step: Mark 0-Distinguishable Pairs',
    description: 'Two states are 0-distinguishable (marked with X) if one is an accepting (final) state and the other is a non-accepting state.',
    mathFormula: 'p \\not\\equiv_0 q \\iff (p ∈ F \\land q ∉ F) \\lor (p ∉ F \\land q ∈ F)',
    details: [
      `Non-accepting partition (Q \\ F): {${nonFinalStates.join(', ')}}`,
      `Accepting partition (F): {${finalStates.join(', ')}}`,
      `Marked ${markedPairs.size} pair(s) in basis step.`
    ]
  });

  // Step 3: Iterative Table-Filling
  let changed = true;
  let round = 1;
  const iterationLogs: string[] = [];

  while (changed) {
    changed = false;
    for (let i = 0; i < reachableStates.length; i++) {
      for (let j = i + 1; j < reachableStates.length; j++) {
        const p = reachableStates[i];
        const q = reachableStates[j];
        const key = pairKey(p, q);

        if (markedPairs.has(key)) continue;

        // Check if delta(p, a) and delta(q, a) lead to a marked pair
        for (const sym of alphabet) {
          const targetP = dfa.transitions[p]?.[sym]?.[0];
          const targetQ = dfa.transitions[q]?.[sym]?.[0];

          if (targetP && targetQ && targetP !== targetQ) {
            const targetPairKey = pairKey(targetP, targetQ);
            if (markedPairs.has(targetPairKey)) {
              markedPairs.set(key, {
                reason: `Distinguishable on symbol '${sym}' because δ(${p}, '${sym}') = ${targetP} and δ(${q}, '${sym}') = ${targetQ}, and {${targetP}, ${targetQ}} is already marked.`
              });
              iterationLogs.push(
                `Round ${round}: Marked {${p}, ${q}} via '${sym}' → {${targetP}, ${targetQ}}`
              );
              changed = true;
              break;
            }
          }
        }
      }
    }
    round++;
  }

  steps.push({
    stepNumber: 3,
    title: 'Inductive Step: Iterative Table-Filling',
    description: 'Iteratively inspect all unmarked pairs {p, q}. If for any symbol a, (δ(p, a), δ(q, a)) is marked, then {p, q} is also marked as distinguishable.',
    mathFormula: 'p \\not\\equiv q \\iff ∃ a ∈ Σ : δ(p, a) \\not\\equiv δ(q, a)',
    details: iterationLogs.length > 0 ? iterationLogs : ['No additional pairs were marked in the inductive rounds.']
  });

  // Step 4: Disjoint Set / Partitioning of Unmarked Equivalent Pairs
  const parent: Record<string, string> = {};
  reachableStates.forEach(s => {
    parent[s] = s;
  });

  function find(s: string): string {
    if (parent[s] === s) return s;
    parent[s] = find(parent[s]);
    return parent[s];
  }

  function union(a: string, b: string) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[rootB] = rootA;
    }
  }

  for (let i = 0; i < reachableStates.length; i++) {
    for (let j = i + 1; j < reachableStates.length; j++) {
      const p = reachableStates[i];
      const q = reachableStates[j];
      const key = pairKey(p, q);
      if (!markedPairs.has(key)) {
        union(p, q);
      }
    }
  }

  // Group into equivalence classes
  const classesMap: Record<string, string[]> = {};
  reachableStates.forEach(s => {
    const root = find(s);
    if (!classesMap[root]) classesMap[root] = [];
    classesMap[root].push(s);
  });

  const equivalenceClasses = Object.values(classesMap).map(cls => normalizeSet(cls));

  const classLabelMap: Record<string, string> = {};
  equivalenceClasses.forEach(cls => {
    const label = formatSet(cls);
    cls.forEach(s => {
      classLabelMap[s] = label;
    });
  });

  const minStates = equivalenceClasses.map(cls => formatSet(cls));
  const minInitialState = classLabelMap[dfa.initialState];
  const minFinalStates = equivalenceClasses
    .filter(cls => hasIntersection(cls, dfa.finalStates))
    .map(cls => formatSet(cls));

  const minTransitions: Record<string, Record<string, string[]>> = {};

  equivalenceClasses.forEach(cls => {
    const fromLabel = formatSet(cls);
    minTransitions[fromLabel] = {};
    const rep = cls[0]; // representative state

    for (const sym of alphabet) {
      const target = dfa.transitions[rep]?.[sym]?.[0];
      if (target && classLabelMap[target]) {
        minTransitions[fromLabel][sym] = [classLabelMap[target]];
      } else {
        minTransitions[fromLabel][sym] = [];
      }
    }
  });

  steps.push({
    stepNumber: 4,
    title: 'Equivalence Classes Identification',
    description: 'All state pairs that remain unmarked in the table are equivalent and merged into a single state in the minimized DFA.',
    details: equivalenceClasses.map(
      cls => `Class ${formatSet(cls)}: ${cls.length > 1 ? `States ${cls.join(' and ')} are equivalent and merged.` : `Singleton state (no equivalents).`}`
    )
  });

  steps.push({
    stepNumber: 5,
    title: 'Minimized DFA Transition Table',
    description: 'The final reduced transition table of the equivalent minimal DFA.',
    tableSnapshot: {
      headers: ['Minimized State', ...alphabet],
      rows: minStates.map(st => ({
        state: st,
        cells: alphabet.map(sym => {
          const targets = minTransitions[st]?.[sym] || [];
          return targets.length > 0 ? targets[0] : '∅';
        }),
        isInitial: st === minInitialState,
        isFinal: minFinalStates.includes(st),
      }))
    }
  });

  const convertedAutomaton: Automaton = {
    name: `${dfa.name || 'DFA'} (Minimized)`,
    type: 'DFA',
    states: minStates,
    alphabet: [...alphabet],
    initialState: minInitialState,
    finalStates: minFinalStates,
    transitions: minTransitions,
  };

  return {
    mode: 'DFA_MINIMIZATION',
    title: 'DFA Minimization (Table-Filling / Myhill-Nerode Algorithm)',
    originalAutomaton: dfa,
    convertedAutomaton,
    steps,
    reachableStates,
    unreachableStates,
    deadStates: [],
    trapStates: [],
    theoreticalNotes: {
      definition: 'DFA Minimization finds the unique minimal state DFA (up to isomorphism) recognizing the same regular language, guaranteed by the Myhill-Nerode Theorem.',
      algorithmName: 'Table-Filling / Myhill-Nerode Equivalence Algorithm',
      keyPoints: [
        `Original reachable states: ${reachableStates.length} ⟶ Minimized states: ${minStates.length}.`,
        'Two states p and q are equivalent if for all strings w ∈ Σ*, δ*(p, w) ∈ F ⇔ δ*(q, w) ∈ F.',
        'Unmarked pairs in the table are equivalent and merged into a single state.',
        'The resulting minimal DFA is guaranteed to have the smallest possible number of states.'
      ],
      examTips: [
        'Step 1 in exams: Always check for and delete unreachable states first.',
        'Draw the lower triangular matrix of pairs (p, q).',
        'Mark all (Final, Non-Final) pairs with X (0-distinguishable).',
        'Iterate on all input symbols until no new pairs can be marked.',
        'Group unmarked pairs into equivalence classes using set notation.'
      ]
    }
  };
}
