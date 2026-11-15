import {
  convertNfaToDfa,
} from '../src/utils/automataEngine.ts';
import { simulateString } from '../src/utils/automataValidator.ts';
import type { Automaton } from '../src/types/automata.ts';

console.log('Testing Dead State Creation in NFA to DFA...');

const exactAbNfa: Automaton = {
  name: 'Exact "ab" Matcher',
  type: 'NFA',
  states: ['q0', 'q1', 'q2'],
  alphabet: ['a', 'b'],
  initialState: 'q0',
  finalStates: ['q2'],
  transitions: {
    q0: {
      a: ['q1'],
      b: [],
    },
    q1: {
      a: [],
      b: ['q2'],
    },
    q2: {
      a: [],
      b: [],
    },
  },
};

const dfa = convertNfaToDfa(exactAbNfa);
console.log('DFA States:', dfa.convertedAutomaton.states);
console.log('DFA Final States:', dfa.convertedAutomaton.finalStates);
console.log('Transitions from {q0}:', dfa.convertedAutomaton.transitions['{q0}']);
console.log('Transitions from ∅:', dfa.convertedAutomaton.transitions['∅']);

console.assert(dfa.convertedAutomaton.states.includes('∅'), 'Expected dead state ∅');
console.assert(dfa.convertedAutomaton.transitions['{q0}']['b'][0] === '∅', 'Expected q0 on b -> ∅');
console.assert(dfa.convertedAutomaton.transitions['∅']['a'][0] === '∅', 'Expected ∅ on a -> ∅');
console.assert(dfa.convertedAutomaton.transitions['∅']['b'][0] === '∅', 'Expected ∅ on b -> ∅');

const simValid = simulateString(dfa.convertedAutomaton, 'ab');
console.log('Sim "ab":', simValid.accepted);
console.assert(simValid.accepted === true, 'Expected "ab" to be accepted');

const simDead = simulateString(dfa.convertedAutomaton, 'ba');
console.log('Sim "ba":', simDead.accepted);
console.assert(simDead.accepted === false, 'Expected "ba" to be rejected via dead state');

console.log('Dead State test PASSED successfully!');

