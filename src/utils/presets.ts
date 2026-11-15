import type { Automaton } from '../types/automata';
import { EPSILON } from '../types/automata';

export interface SampleProblem {
  id: string;
  category: 'NFA_TO_DFA' | 'ENFA_TO_DFA' | 'ENFA_TO_NFA' | 'DFA_TO_NFA';
  title: string;
  description: string;
  automaton: Automaton;
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  // 1. NFA to DFA
  {
    id: 'nfa-ends-in-01',
    category: 'NFA_TO_DFA',
    title: 'Strings ending with "01"',
    description: 'Classic university exam problem: NFA accepting all binary strings ending in 01.',
    automaton: {
      name: 'NFA (Ends with 01)',
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0', 'q1'],
          '1': ['q0'],
        },
        q1: {
          '0': [],
          '1': ['q2'],
        },
        q2: {
          '0': [],
          '1': [],
        },
      },
    },
  },
  {
    id: 'nfa-contains-ab',
    category: 'NFA_TO_DFA',
    title: 'Strings containing substring "ab"',
    description: 'NFA accepting all strings over {a, b} that contain the substring "ab".',
    automaton: {
      name: 'NFA (Contains "ab")',
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          a: ['q0', 'q1'],
          b: ['q0'],
        },
        q1: {
          a: [],
          b: ['q2'],
        },
        q2: {
          a: ['q2'],
          b: ['q2'],
        },
      },
    },
  },
  {
    id: 'nfa-second-symbol-from-end',
    category: 'NFA_TO_DFA',
    title: 'Second symbol from end is "1"',
    description: 'NFA accepting all binary strings whose second symbol from the right is 1.',
    automaton: {
      name: 'NFA (2nd from end is 1)',
      type: 'NFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0'],
          '1': ['q0', 'q1'],
        },
        q1: {
          '0': ['q2'],
          '1': ['q2'],
        },
        q2: {
          '0': [],
          '1': [],
        },
      },
    },
  },

  // 2. ε-NFA to DFA
  {
    id: 'enfa-classic-abb',
    category: 'ENFA_TO_DFA',
    title: 'Classic (a|b)*abb with ε-transitions',
    description: 'Standard textbook problem: ε-NFA for (a + b)*abb converted to DFA.',
    automaton: {
      name: 'ε-NFA for (a|b)*abb',
      type: 'ENFA',
      states: ['q0', 'q1', 'q2', 'q3', 'q4'],
      alphabet: ['a', 'b'],
      initialState: 'q0',
      finalStates: ['q4'],
      transitions: {
        q0: {
          a: ['q0'],
          b: ['q0'],
          [EPSILON]: ['q1'],
        },
        q1: {
          a: ['q2'],
          b: [],
        },
        q2: {
          a: [],
          b: ['q3'],
        },
        q3: {
          a: [],
          b: ['q4'],
        },
        q4: {
          a: [],
          b: [],
        },
      },
    },
  },
  {
    id: 'enfa-star-chain',
    category: 'ENFA_TO_DFA',
    title: 'Language 0* 1* 2* with ε-transitions',
    description: 'ε-NFA accepting non-decreasing sequences of numbers 0, 1, and 2.',
    automaton: {
      name: 'ε-NFA (0* 1* 2*)',
      type: 'ENFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1', '2'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0'],
          '1': [],
          '2': [],
          [EPSILON]: ['q1'],
        },
        q1: {
          '0': [],
          '1': ['q1'],
          '2': [],
          [EPSILON]: ['q2'],
        },
        q2: {
          '0': [],
          '1': [],
          '2': ['q2'],
        },
      },
    },
  },
  {
    id: 'enfa-exam-notebook-q0-q1-q2',
    category: 'ENFA_TO_DFA',
    title: 'Notebook Question: ε-NFA with transitions {q1}, {q0}, {q2}',
    description: 'Convert ε-NFA to DFA using ε-closure and subset construction.',
    automaton: {
      name: 'ε-NFA (Notebook Problem)',
      type: 'ENFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0'],
          '1': [],
          [EPSILON]: ['q1'],
        },
        q1: {
          '0': [],
          '1': ['q2'],
          [EPSILON]: [],
        },
        q2: {
          '0': [],
          '1': [],
          [EPSILON]: [],
        },
      },
    },
  },

  // 3. ε-NFA to NFA
  {
    id: 'enfa-to-nfa-standard',
    category: 'ENFA_TO_NFA',
    title: 'Standard 3-State Epsilon Elimination',
    description: 'Eliminates ε-transitions from a 3-state automaton while preserving language equivalence.',
    automaton: {
      name: 'ε-NFA Standard Exam Machine',
      type: 'ENFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          a: ['q0'],
          b: [],
          [EPSILON]: ['q1'],
        },
        q1: {
          a: [],
          b: ['q1'],
          [EPSILON]: ['q2'],
        },
        q2: {
          a: ['q2'],
          b: ['q2'],
        },
      },
    },
  },

  // 4. DFA to NFA
  {
    id: 'dfa-even-zeros',
    category: 'DFA_TO_NFA',
    title: 'Even Number of 0s',
    description: 'DFA accepting binary strings with an even count of symbol 0.',
    automaton: {
      name: 'DFA (Even zeros)',
      type: 'DFA',
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q0'],
      transitions: {
        q0: {
          '0': ['q1'],
          '1': ['q0'],
        },
        q1: {
          '0': ['q0'],
          '1': ['q1'],
        },
      },
    },
  },
  {
    id: 'dfa-divisible-by-3',
    category: 'DFA_TO_NFA',
    title: 'Binary Numbers Divisible by 3',
    description: 'DFA accepting binary numbers (MSB first) that are multiples of 3.',
    automaton: {
      name: 'DFA (Mod 3 = 0)',
      type: 'DFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q0'],
      transitions: {
        q0: {
          '0': ['q0'],
          '1': ['q1'],
        },
        q1: {
          '0': ['q2'],
          '1': ['q0'],
        },
        q2: {
          '0': ['q1'],
          '1': ['q2'],
        },
      },
    },
  },
];
