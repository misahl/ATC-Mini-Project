import type {
  Automaton,
  AutomatonType,
  SimulationResult,
  SimulationStep,
  ValidationReport,
} from '../types/automata';
import {
  computeMove,
  getEpsilonClosure,
  getSetEpsilonClosure,
  isEpsilon,
} from './automataEngine';

/**
 * Validates an automaton and computes graph analytics
 */
export function validateAutomaton(automaton: Automaton): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const stateSet = new Set(automaton.states);
  const alphabetSet = new Set(automaton.alphabet.filter(s => !isEpsilon(s)));

  // Check state count
  if (automaton.states.length === 0) {
    errors.push('The automaton must have at least one state.');
  }

  // Check alphabet
  if (alphabetSet.size === 0) {
    errors.push('The automaton must have at least one alphabet symbol.');
  }

  // Check initial state
  if (!automaton.initialState) {
    errors.push('Initial state is not specified.');
  } else if (!stateSet.has(automaton.initialState)) {
    errors.push(`Initial state "${automaton.initialState}" does not exist in the state set.`);
  }

  // Check final states
  for (const fs of automaton.finalStates) {
    if (!stateSet.has(fs)) {
      errors.push(`Final state "${fs}" does not exist in the state set.`);
    }
  }

  if (automaton.finalStates.length === 0) {
    warnings.push('No final (accepting) states are selected. This automaton rejects all strings.');
  }

  // Check transitions targets and detect type
  let hasEpsilonTransitions = false;
  let hasNonDeterministicBranching = false;
  let hasMissingTransitions = false;
  let transitionCount = 0;
  const missingTransitions: Array<{ state: string; symbol: string }> = [];

  for (const state of automaton.states) {
    const transitions = automaton.transitions[state] || {};

    for (const [sym, targets] of Object.entries(transitions)) {
      if (!targets || targets.length === 0) continue;

      transitionCount += targets.length;

      if (isEpsilon(sym)) {
        hasEpsilonTransitions = true;
      }

      if (targets.length > 1) {
        hasNonDeterministicBranching = true;
      }

      for (const target of targets) {
        if (!stateSet.has(target)) {
          errors.push(
            `Transition from "${state}" on symbol "${sym}" points to unknown state "${target}".`
          );
        }
      }
    }

    // Check completeness across standard alphabet
    for (const sym of alphabetSet) {
      const targets = transitions[sym] || [];
      if (targets.length === 0) {
        hasMissingTransitions = true;
        missingTransitions.push({ state, symbol: sym });
      }
    }
  }

  // Determine actual type
  let detectedType: AutomatonType = 'DFA';
  if (hasEpsilonTransitions) {
    detectedType = 'ENFA';
  } else if (hasNonDeterministicBranching || hasMissingTransitions) {
    detectedType = 'NFA';
  }

  // Reachability analysis (BFS from initialState)
  const reachable = new Set<string>();
  if (automaton.initialState && stateSet.has(automaton.initialState)) {
    const queue = [automaton.initialState];
    reachable.add(automaton.initialState);

    // Initial epsilon closure if ε-NFA
    if (detectedType === 'ENFA') {
      const epsInit = getEpsilonClosure(automaton, automaton.initialState);
      epsInit.forEach(s => {
        reachable.add(s);
        queue.push(s);
      });
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const tr = automaton.transitions[current] || {};

      for (const targets of Object.values(tr)) {
        if (!targets) continue;
        for (const t of targets) {
          if (!reachable.has(t)) {
            reachable.add(t);
            queue.push(t);
            if (detectedType === 'ENFA') {
              const epsTarget = getEpsilonClosure(automaton, t);
              epsTarget.forEach(es => {
                if (!reachable.has(es)) {
                  reachable.add(es);
                  queue.push(es);
                }
              });
            }
          }
        }
      }
    }
  }

  const unreachable = automaton.states.filter(s => !reachable.has(s));
  if (unreachable.length > 0) {
    warnings.push(
      `Unreachable state(s) detected: ${unreachable.join(', ')}. These states can never be reached from ${automaton.initialState}.`
    );
  }

  // Dead states analysis: States that cannot reach ANY final state
  // Can be found via backward BFS from final states
  const canReachFinal = new Set<string>(automaton.finalStates);
  const revQueue = [...automaton.finalStates];

  // Build reverse transition graph
  const reverseGraph: Record<string, Set<string>> = {};
  for (const s of automaton.states) {
    reverseGraph[s] = new Set<string>();
  }

  for (const fromState of automaton.states) {
    const tr = automaton.transitions[fromState] || {};
    for (const targets of Object.values(tr)) {
      if (!targets) continue;
      for (const toState of targets) {
        if (reverseGraph[toState]) {
          reverseGraph[toState].add(fromState);
        }
      }
    }
  }

  while (revQueue.length > 0) {
    const current = revQueue.shift()!;
    const parents = reverseGraph[current] || new Set();
    for (const p of parents) {
      if (!canReachFinal.has(p)) {
        canReachFinal.add(p);
        revQueue.push(p);
      }
    }
  }

  const deadStates = automaton.states.filter(s => reachable.has(s) && !canReachFinal.has(s));

  // Trap states: state transitions only to itself for all symbols, and not final
  const trapStates = automaton.states.filter(s => {
    if (automaton.finalStates.includes(s)) return false;
    const tr = automaton.transitions[s] || {};
    let allSelf = true;
    for (const sym of alphabetSet) {
      const targets = tr[sym] || [];
      if (targets.length !== 1 || targets[0] !== s) {
        allSelf = false;
        break;
      }
    }
    return allSelf;
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    detectedType,
    completeness: {
      isComplete: missingTransitions.length === 0,
      missingTransitions,
    },
    reachability: {
      reachable: Array.from(reachable),
      unreachable,
    },
    deadStates: {
      dead: deadStates,
      trap: trapStates,
    },
    stats: {
      stateCount: automaton.states.length,
      alphabetSize: alphabetSet.size,
      finalStateCount: automaton.finalStates.length,
      transitionCount,
    },
  };
}

/**
 * Simulates a test string step-by-step on an automaton
 */
export function simulateString(automaton: Automaton, input: string): SimulationResult {
  const cleanInput = input.trim();
  const symbols = cleanInput.length === 0 ? [] : cleanInput.split('');

  const isEnfa = automaton.type === 'ENFA' || Object.values(automaton.transitions).some(
    t => Object.keys(t).some(isEpsilon)
  );

  // Validate that all symbols belong to alphabet (except empty string)
  const validSymbols = new Set(automaton.alphabet.filter(s => !isEpsilon(s)));
  for (const sym of symbols) {
    if (!validSymbols.has(sym)) {
      return {
        inputString: input,
        accepted: false,
        steps: [],
        finalActiveStates: [],
        reason: `Symbol "${sym}" is not part of the alphabet {${Array.from(validSymbols).join(', ')}}.`,
      };
    }
  }

  const steps: SimulationStep[] = [];

  // Step 0: Initial states
  let currentStates: string[] = [];
  if (isEnfa) {
    currentStates = getEpsilonClosure(automaton, automaton.initialState);
    steps.push({
      stepIndex: 0,
      symbolConsumed: null,
      activeStates: currentStates,
      transitionsTaken: [],
      description: `Start at initial state ${automaton.initialState}. Taking ε-closure: {${currentStates.join(', ')}}`,
    });
  } else {
    currentStates = [automaton.initialState];
    steps.push({
      stepIndex: 0,
      symbolConsumed: null,
      activeStates: currentStates,
      transitionsTaken: [],
      description: `Start at initial state ${automaton.initialState}.`,
    });
  }

  // Process each symbol
  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    const transitionsTaken: Array<{ from: string; symbol: string; to: string }> = [];

    // Compute direct moves
    const directMoves = computeMove(automaton, currentStates, sym);

    for (const fromState of currentStates) {
      const targets = automaton.transitions[fromState]?.[sym] || [];
      for (const to of targets) {
        transitionsTaken.push({ from: fromState, symbol: sym, to });
      }
    }

    if (isEnfa) {
      const nextClosure = getSetEpsilonClosure(automaton, directMoves);
      currentStates = nextClosure;
      steps.push({
        stepIndex: i + 1,
        symbolConsumed: sym,
        activeStates: currentStates,
        transitionsTaken,
        description: `Read symbol "${sym}": Direct move yields {${directMoves.join(', ') || '∅'}}. ε-closure yields {${nextClosure.join(', ') || '∅'}}.`,
      });
    } else {
      currentStates = directMoves;
      steps.push({
        stepIndex: i + 1,
        symbolConsumed: sym,
        activeStates: currentStates,
        transitionsTaken,
        description: `Read symbol "${sym}": Active states become {${currentStates.join(', ') || '∅'}}.`,
      });
    }

    if (currentStates.length === 0) {
      // Machine has reached a dead end
      break;
    }
  }

  const finalSet = new Set(automaton.finalStates);
  const acceptedStates = currentStates.filter(s => finalSet.has(s));
  const accepted = acceptedStates.length > 0;

  let reason = '';
  if (symbols.length === 0) {
    if (accepted) {
      reason = `Empty string ε is ACCEPTED because initial state ${automaton.initialState} (or its ε-closure) contains final state(s): {${acceptedStates.join(', ')}}.`;
    } else {
      reason = `Empty string ε is REJECTED because active states do not contain any final state.`;
    }
  } else if (currentStates.length === 0) {
    reason = `String is REJECTED because no valid transition exists (machine reached dead state / ∅).`;
  } else if (accepted) {
    reason = `String "${input}" is ACCEPTED because active states {${currentStates.join(', ')}} contain final state(s): {${acceptedStates.join(', ')}}.`;
  } else {
    reason = `String "${input}" is REJECTED because none of the final active states {${currentStates.join(', ')}} belong to final states {${automaton.finalStates.join(', ')}}.`;
  }

  return {
    inputString: input,
    accepted,
    steps,
    finalActiveStates: currentStates,
    reason,
  };
}
