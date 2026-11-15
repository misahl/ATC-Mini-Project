export type AutomatonType = 'DFA' | 'NFA' | 'ENFA';

export const EPSILON = 'ε';
export const EPSILON_ALIASES = ['ε', 'e', 'eps', 'E', 'lambda', 'λ'];

export interface Automaton {
  id?: string;
  name?: string;
  type: AutomatonType;
  states: string[];
  alphabet: string[];
  initialState: string;
  finalStates: string[];
  // transitions[state][symbol] = array of target states
  // symbol can be an alphabet symbol or EPSILON
  transitions: Record<string, Record<string, string[]>>;
}

export interface TransitionStepLog {
  subset: string[];
  subsetLabel: string;
  symbol: string;
  directMove?: string[];
  epsilonClosure?: string[];
  targetSubset: string[];
  targetLabel: string;
  isNewState: boolean;
  explanation: string;
}

export interface StepLog {
  stepNumber: number;
  title: string;
  description: string;
  mathFormula?: string;
  details?: string[];
  tableSnapshot?: {
    headers: string[];
    rows: Array<{
      state: string;
      cells: string[];
      isInitial?: boolean;
      isFinal?: boolean;
    }>;
  };
}

export interface ConversionResult {
  mode: 'DFA_TO_NFA' | 'NFA_TO_DFA' | 'ENFA_TO_DFA' | 'ENFA_TO_NFA' | 'DFA_MINIMIZATION';
  title: string;
  originalAutomaton: Automaton;
  convertedAutomaton: Automaton;
  steps: StepLog[];
  stateMapping?: Record<string, string>; // e.g. "{q0, q1}" -> "A" or "q0q1"
  epsilonClosures?: Record<string, string[]>;
  reachableStates: string[];
  unreachableStates: string[];
  deadStates: string[];
  trapStates: string[];
  theoreticalNotes: {
    definition: string;
    algorithmName: string;
    keyPoints: string[];
    examTips: string[];
  };
}

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedType: AutomatonType;
  completeness: {
    isComplete: boolean;
    missingTransitions: Array<{ state: string; symbol: string }>;
  };
  reachability: {
    reachable: string[];
    unreachable: string[];
  };
  deadStates: {
    dead: string[]; // cannot reach any final state
    trap: string[]; // cannot escape from itself
  };
  stats: {
    stateCount: number;
    alphabetSize: number;
    finalStateCount: number;
    transitionCount: number;
  };
}

export interface SimulationStep {
  stepIndex: number;
  symbolConsumed: string | null;
  activeStates: string[];
  transitionsTaken: Array<{ from: string; symbol: string; to: string }>;
  description: string;
}

export interface SimulationResult {
  inputString: string;
  accepted: boolean;
  steps: SimulationStep[];
  finalActiveStates: string[];
  reason: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: 'DFA' | 'NFA' | 'ENFA' | 'Conversion';
}

export interface UncertaintyItem {
  element: string; // e.g. "Transition δ(q1, 0)" or "Final state q2"
  reason: string;  // e.g. "Double circle was faint in drawing"
  suggestion?: string;
}

export interface RecognizedAutomatonData {
  type: AutomatonType;
  states: string[];
  alphabet: string[];
  initialState: string;
  finalStates: string[];
  transitions: Record<string, Record<string, string[]>>;
  questionText?: string;
  detectedTargetConversion?: 'NFA_TO_DFA' | 'ENFA_TO_DFA' | 'ENFA_TO_NFA' | 'DFA_TO_NFA' | 'DFA_MINIMIZATION';
  uncertainties?: UncertaintyItem[];
  notes?: string;
  confidenceScore?: number;
}

export interface ScanApiResponse {
  success: boolean;
  data?: RecognizedAutomatonData;
  error?: string;
  message?: string;
  provider?: string;
}


