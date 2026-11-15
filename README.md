# AUTOMATA SOLVER – Automata Theory Assistant

> **Your Complete Automata Theory Companion for 3rd-Year Computer Science Engineering Students**

An intelligent, interactive, mathematically rigorous web application that solves DFA, NFA, and ε-NFA conversion problems with complete step-by-step solutions, intermediate power-set calculations, interactive state diagrams, and string simulation.

---

## 🌟 Key Features

### 1. Home Dashboard
- Professional technical dark-navy UI with purple and cyan accents.
- Direct access to core solvers:
  - **DFA to NFA**
  - **NFA to DFA (Subset Construction)**
  - **ε-NFA to DFA (Epsilon Closure + Subset Construction)**
  - **ε-NFA to NFA (Epsilon Elimination)**
- Additional companion tools:
  - **Automata Validator & Graph Analyzer**
  - **Interactive String Acceptance Tester / Tape Stepper**
  - **Curriculum Notes & Self-Assessment Quiz**

### 2. Live Camera Scanner & AI Vision Recognition
- **In-App Device Camera Access**:
  - Live viewfinder directly inside the web interface using `navigator.mediaDevices.getUserMedia()`.
  - Prefer rear-facing camera on mobile devices (`facingMode: { ideal: 'environment' }`) with front/rear flip button.
  - Video freeze & snapshot capture using the HTML5 Canvas API.
  - 90° clockwise photo rotation for notebook pages photographed in landscape.
  - Instant image file upload fallback (`PNG`, `JPEG`, `WebP`) for existing phone gallery photos or exam papers.
  - Clean camera stream shutdown on modal close or unmount (releases hardware camera LED).
- **Multimodal AI Vision Processing**:
  - Secure backend endpoint `/api/scan-automaton` supporting **Google Gemini** (`gemini-2.5-flash`, `gemini-1.5-flash`) and **OpenAI** (`gpt-4o-mini`).
  - Recognizes handwritten state diagrams (circles, double concentric accepting circles, start arrow, self-loops, epsilon $\varepsilon$/$\lambda$ transitions).
  - Recognizes printed/handwritten transition tables with arrow initial states and asterisk final states.
  - Extracts question objectives automatically (e.g. "Convert NFA to DFA", "Minimize the following DFA").
- **Uncertainty Highlighting & Pre-Solve Verification**:
  - Identifies ambiguous strokes (e.g. faint double circles, overlapping arrows).
  - Interactive verification table allowing students to edit any cell or toggle final states before executing the solver.
  - One-click transfer directly into the TypeScript mathematical conversion engine.
- **Zero Client-Side Key Exposure**:
  - API keys stored securely in `.env` or set directly through the in-app modal. Never exposed to browser bundles.

### 3. Automata Input System
- Dynamic states ($Q$) and alphabet ($\Sigma$) configuration.
- Support for arbitrary valid state names (`q0`, `q1`, `A`, `B`, etc.).
- Initial state selector & multi-toggle final states ($F$).
- Live editable transition table $\delta(q, a)$ supporting:
  - Single target states for DFA.
  - Multiple target states for NFA (e.g. `q0, q1`).
  - Spontaneous $\varepsilon$-transitions for $\varepsilon$-NFA.
  - Empty moves / Dead states ($\emptyset$).
- Preset button to automatically load classic university exam problems.

### 3. Rigorous Mathematical Conversion Engines
- **DFA to NFA**: Singleton embedding mapping $\delta(q, a) = p \implies \delta'(q, a) = \{p\}$.
- **NFA to DFA**: Rabin-Scott Subset Construction:
  - Discovers all reachable subset states starting from $\{q_0\}$.
  - Automatically identifies and handles dead / trap states $\emptyset$.
  - Omits unreachable theoretical subsets from $2^Q$.
  - Correctly maps accepting states: $F_{DFA} = \{S \subseteq Q \mid S \cap F_{NFA} \neq \emptyset\}$.
- **ε-NFA to DFA**:
  - Full $\varepsilon$-closure calculation for all states.
  - Step-by-step intermediate $\text{move}(S, a)$ and $\varepsilon\text{-closure}(\text{move})$ calculations.
- **ε-NFA to NFA**:
  - Elimination of $\varepsilon$-moves via $\delta'(q, a) = \varepsilon\text{-closure}(\text{move}(\varepsilon\text{-closure}(q), a))$.
  - New accepting states determination: $F' = \{q \in Q \mid \varepsilon\text{-closure}(q) \cap F \neq \emptyset\}$.

### 4. Interactive State Diagram Visualization
- **Circles** for standard states, **double concentric circles** for final states.
- **Start indicator arrow** for initial state.
- **Curved directed arrows** for transitions with collision-free bidirectional edges.
- **Self-loops** with neat top-arc geometry.
- **Multi-symbol transition aggregation** (e.g. `0, 1` or `a, b`).
- **Interactive features**:
  - Drag-and-drop state repositioning.
  - Pan and Zoom controls.
  - Reset layout button.
  - One-click **Export SVG** button for exam assignment submissions.

### 5. String Acceptance Simulator
- Test any input string $w \in \Sigma^*$ step-by-step.
- Real-time active state highlighting on the state diagram.
- Step-by-step playback with input tape tracker.
- Clear **ACCEPTED** or **REJECTED** verdict with complete formal reasoning.

### 6. Learning Section (Exam Preparation)
- Detailed curriculum notes on DFA vs NFA vs $\varepsilon$-NFA.
- Formal 5-tuple mathematical definitions.
- Comparative analysis table.
- Interactive 6-question practice quiz with instant explanations and scoring.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (version 18 or newer)
- npm

### Installation
```bash
# Clone or navigate into the project directory
cd "ATC- mini Project"

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the Vite development server
npm run dev
```

Open your browser at the local URL (usually `http://localhost:5173`).

### API Key Configuration (Optional for Camera AI Scanner)
To enable the multimodal camera scan feature, either click the **Key icon** in the top navbar inside the app or configure `.env`:
```env
# Google Gemini (Recommended - free tier available at aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here

# Or OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key_here
```
*Note: All manual input, conversion solvers, string simulation, diagrams, and quizzes work 100% offline without any API keys.*

### Running Production Build
```bash
npm run build
npm run preview
```

### Running Mathematical Verification Tests
```bash
npm run test:math
```

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + TSX
- **Styling**: Tailwind CSS v4 (Dark navy theme `#0A0F1D` with purple and blue accents)
- **Icons**: Lucide React
- **Diagrams**: Native high-DPI Interactive SVG Canvas engine
