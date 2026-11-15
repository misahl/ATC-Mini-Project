import { convertEnfaToNfa } from '../src/utils/automataEngine.ts';
import { simulateString } from '../src/utils/automataValidator.ts';
import type { Automaton } from '../src/types/automata.ts';
import { EPSILON } from '../src/types/automata.ts';

console.log('Testing ε-NFA to NFA (Epsilon Elimination)...');

// Textbook problem:
// q0 -a-> q0, q0 -ε-> q1
// q1 -b-> q1, q1 -ε-> q2
// q2 -c-> q2 (final)
const enfaABC: Automaton = {
  name: 'a* b* c* ε-NFA',
  type: 'ENFA',
  states: ['q0', 'q1', 'q2'],
  alphabet: ['a', 'b', 'c'],
  initialState: 'q0',
  finalStates: ['q2'],
  transitions: {
    q0: {
      a: ['q0'],
      b: [],
      c: [],
      [EPSILON]: ['q1'],
    },
    q1: {
      a: [],
      b: ['q1'],
      c: [],
      [EPSILON]: ['q2'],
    },
    q2: {
      a: [],
      b: [],
      c: ['q2'],
    },
  },
};

const nfaResult = convertEnfaToNfa(enfaABC);
console.log('Converted NFA states:', nfaResult.convertedAutomaton.states);
console.log('Converted NFA alphabet:', nfaResult.convertedAutomaton.alphabet);
console.log('Converted NFA final states:', nfaResult.convertedAutomaton.finalStates);

// Verify alphabet does NOT have epsilon
console.assert(!nfaResult.convertedAutomaton.alphabet.includes(EPSILON), 'Alphabet should not contain ε');

// Verify all states are final because all states can reach q2 via epsilon
console.assert(nfaResult.convertedAutomaton.finalStates.includes('q0'), 'q0 should be final');
console.assert(nfaResult.convertedAutomaton.finalStates.includes('q1'), 'q1 should be final');
console.assert(nfaResult.convertedAutomaton.finalStates.includes('q2'), 'q2 should be final');

// Verify transitions:
// From q0 on 'b':
// eps-closure(q0) = {q0, q1, q2}
// move({q0, q1, q2}, b) = {q1}
// eps-closure({q1}) = {q1, q2}
// So delta'(q0, b) should be {q1, q2}
const deltaQ0b = nfaResult.convertedAutomaton.transitions['q0']['b'];
console.log("delta'(q0, b):", deltaQ0b);
console.assert(deltaQ0b.includes('q1') && deltaQ0b.includes('q2'), "Expected delta'(q0, b) = {q1, q2}");

console.log('ε-NFA to NFA test PASSED successfully!');

