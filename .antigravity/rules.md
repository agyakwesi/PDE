# Project Rules & Agent Guidelines

## 🧠 General Agent Behavior
- **Be Concise:** Do not explain basic code concepts. Focus on the logic and the "why" of complex decisions.
- **No Hallucinations:** If you do not see a library in `requirements.txt` or `package.json`, DO NOT import it. Ask permission to install it first.
- **Verify Before Committing:** Always run a syntax check or a basic build before marking a task as complete.
- **Code Comments:** Add comments only for complex logic. Do not add comments for obvious code (e.g., avoid `# Function to add two numbers`).

## 🐍 Python Guidelines (Backend)
- **Type Hinting:** All function arguments and return values must use Python type hints (`typing` module or standard types).
- **Modern Python:** Use Python 3.10+ syntax (e.g., match/case statements, union types `|` instead of `Union[]`).
- **Error Handling:** Use specific `try/except` blocks. Never use bare `except:`.
- **Data Validation:** Prefer `Pydantic` models over raw dictionaries for data transfer objects.
- **Formatting:** Adhere to PEP 8 standards.
- **Async:** If using frameworks like FastAPI, ensure database calls are `await`ed properly.

## ⚛️ React Guidelines (Frontend)
- **Functional Components:** strict usage of Functional Components with Hooks. No Class Components.
- **State Management:** Prefer local state (`useState`) or Context API for simple apps. Only suggest Redux/Zustand if the complexity warrants it.
- **Styling:** (Adjust this line based on your preference) Use Tailwind CSS utility classes. Avoid creating separate `.css` files unless necessary for global styles.
- **Naming:** Use PascalCase for components (e.g., `UserProfile.tsx`) and camelCase for functions/variables.
- **Performance:** Memoize expensive calculations with `useMemo` and callbacks with `useCallback` where appropriate.

## 🧪 Testing Requirements
- **Python:** Use `pytest`.
- **React:** Use `React Testing Library`.
- **Constraint:** Do not mark a "refactor" task as complete until existing tests pass.
# Agent Behavior Guidelines

## 1. Negative Constraints (The "Do Not" List)
* **NO Breaking Changes:** You must not break existing functionality. If a change risks breaking backward compatibility, you must stop and ask for permission.
* **NO Unauthorized Dependencies:** Do not add new libraries or dependencies (e.g., npm packages, pip modules) unless explicitly requested.

## 2. System Designer Reasoning
* **Complete Lifecycle:** Do not just output the feature code. You must include requirements for:
    * **Logging:** Structured logging for debugging.
    * **Error Handling:** Graceful failure modes (no silent failures).
    * **Security:** Input validation and sanitization.
* **Self-Correction:** Before finalizing output, review your code against these requirements.

## 3. Context Anchoring
* **Match Existing Style:** Analyze the current codebase before writing. Mimic the existing patterns, naming conventions, and directory structure.
* **Integration over Redesign:** Do not refactor unrelated code. Fit the new feature into the existing architecture.