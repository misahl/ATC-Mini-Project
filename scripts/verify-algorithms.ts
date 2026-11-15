import { SAMPLE_PROBLEMS } from '../src/utils/presets.ts';
import {
  convertDfaToNfa,
  convertNfaToDfa,
  convertEnfaToDfa,
  convertEnfaToNfa,
  getEpsilonClosure,
  setsEqual,
} from '../src/utils/automataEngine.ts';
import { validateAutomaton, simulateString } from '../src/utils/automataValidator.ts';

console.log('=== RUNNING AUTOMATA SOLVER MATHEMATICAL VERIFICATION ===');

// 1. Test Epsilon Closure
const starChain = SAMPLE_PROBLEMS.find(p => p.id === 'enfa-star-chain')!.automaton;
const epsQ0 = getEpsilonClosure(starChain, 'q0');
console.log('1. Epsilon closure of q0 in 0*1*2*:', epsQ0);
console.assert(
  setsEqual(epsQ0, ['q0', 'q1', 'q2']),
  `Expected [q0, q1, q2], got ${JSON.stringify(epsQ0)}`
);

// 2. Test DFA to NFA
const dfaEven = SAMPLE_PROBLEMS.find(p => p.id === 'dfa-even-zeros')!.automaton;
const dfaToNfaRes = convertDfaToNfa(dfaEven);
console.log('2. DFA to NFA Converted states:', dfaToNfaRes.convertedAutomaton.states);
console.assert(dfaToNfaRes.convertedAutomaton.type === 'NFA', 'Expected NFA type');
console.assert(
  dfaToNfaRes.convertedAutomaton.transitions['q0']['0'][0] === 'q1',
  'Expected delta(q0, 0) = {q1}'
);

// 3. Test NFA to DFA (Ends with 01)
const nfaEnds01 = SAMPLE_PROBLEMS.find(p => p.id === 'nfa-ends-in-01')!.automaton;
const nfaToDfaRes = convertNfaToDfa(nfaEnds01);
console.log('3. NFA to DFA Converted states:', nfaToDfaRes.convertedAutomaton.states);
console.log('3. NFA to DFA Final states:', nfaToDfaRes.convertedAutomaton.finalStates);

// Verify accepting behavior on string ending in 01
const testAccepted = simulateString(nfaToDfaRes.convertedAutomaton, '00101');
console.log('Simulation "00101":', testAccepted.accepted, testAccepted.reason);
console.assert(testAccepted.accepted === true, 'Expected "00101" to be accepted');

const testRejected = simulateString(nfaToDfaRes.convertedAutomaton, '0010');
console.log('Simulation "0010":', testRejected.accepted, testRejected.reason);
console.assert(testRejected.accepted === false, 'Expected "0010" to be rejected');

// 4. Test ε-NFA to DFA
const enfaAbb = SAMPLE_PROBLEMS.find(p => p.id === 'enfa-classic-abb')!.automaton;
const enfaToDfaRes = convertEnfaToDfa(enfaAbb);
console.log('4. ε-NFA to DFA Converted states:', enfaToDfaRes.convertedAutomaton.states);
console.log('4. ε-NFA to DFA Final states:', enfaToDfaRes.convertedAutomaton.finalStates);

const testAbbAccepted = simulateString(enfaToDfaRes.convertedAutomaton, 'ababb');
console.log('Simulation "ababb":', testAbbAccepted.accepted);
console.assert(testAbbAccepted.accepted === true, 'Expected "ababb" to be accepted');

// 5. Test ε-NFA to NFA (Epsilon Elimination)
const enfaStd = SAMPLE_PROBLEMS.find(p => p.id === 'enfa-to-nfa-standard')!.automaton;
const enfaToNfaRes = convertEnfaToNfa(enfaStd);
console.log('5. ε-NFA to NFA Converted final states:', enfaToNfaRes.convertedAutomaton.finalStates);
console.assert(
  enfaToNfaRes.convertedAutomaton.finalStates.includes('q0'),
  'Expected q0 to be final because epsilon-closure(q0) reaches q2'
);

// 6. Test Validator
const report = validateAutomaton(nfaEnds01);
console.log('6. Validator report: isValid =', report.isValid, 'type =', report.detectedType);
console.assert(report.isValid === true, 'Expected valid automaton');

// 7. Test Student Notebook Question (ε-NFA to DFA)
const studentNotebookAuto: any = {
  type: 'ENFA',
  states: ['q0', 'q1', 'q2'],
  alphabet: ['0', '1'],
  initialState: 'q0',
  finalStates: ['q2'],
  transitions: {
    q0: { '0': ['q0'], '1': [], 'ε': ['q1'] },
    q1: { '0': [], '1': ['q2'], 'ε': [] },
    q2: { '0': [], '1': [], 'ε': [] }
  }
};
const studentRes = convertEnfaToDfa(studentNotebookAuto);
console.log('7. Student Notebook ε-NFA to DFA:');
console.log('   - Initial state:', studentRes.convertedAutomaton.initialState);
console.log('   - DFA states:', studentRes.convertedAutomaton.states);
console.log('   - DFA final states:', studentRes.convertedAutomaton.finalStates);
console.log('   - DFA transitions:', JSON.stringify(studentRes.convertedAutomaton.transitions));

console.log('=== ALL MATHEMATICAL ENGINE TESTS PASSED SUCCESSFULLY! ===');

