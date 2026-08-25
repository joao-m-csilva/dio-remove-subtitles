# AGENTS.md - Development Rules & Guidelines

These guidelines apply to all AI agents, contributors, and automated tooling working within this repository.

---

## 1. General Principles

- **Simplicity and Maintainability**: Prioritize clean, readable, and performant code over premature optimization or unnecessary abstractions.
- **Inspect Before Modifying**: Always analyze existing project files, architectural patterns, and dependencies before creating or altering code.
- **Dead Code Elimination**: Remove unused imports, dead functions, obsolete styles, and dangling files when updating features.
- **Natural Tone**: Avoid inflated marketing jargon, buzzwords, or condescending parenthetical remarks in documentation and commit messages.

---

## 2. Code Comments

- **Language**: All code comments must be written strictly in **English**.
- **Relevance**: Comments should only exist to clarify non-obvious architectural decisions, API quirks, browser compatibility workarounds, or complex logic.
- **No Obvious Comments**: Do not write comments that merely restate what the code clearly does.
- **Cleanliness**: Keep comments concise and avoid visual clutter.

---

## 3. Chrome Extension (Manifest V3) Architecture

### A. SPA and React/Next.js Compatibility
- The target platform ([dio.me](https://web.dio.me)) is a Single Page Application built with Next.js and React SSR/SSG.
- **Injection Timing**: Content scripts must be registered with `"run_at": "document_idle"`. Never inject DOM mutations at `document_start`, as mutating elements before or during React hydration will trigger hydration errors and cause blank screen crashes.
- **Defensive Programming**: Wrap all DOM queries, `postMessage` dispatches, and `chrome.storage` calls inside `try/catch` blocks to prevent unhandled exceptions from affecting host page execution.
- **Performance & Debounce**: Debounce `MutationObserver` callbacks and verify that added nodes specifically include video elements or player wrappers (`iframe`, `video`, `[data-player]`) before executing state changes.

### B. Scoped CSS Rules
- **Never use broad generic attribute selectors** (such as `[class*="subtitle"]` or `[class*="caption"]`) globally. In Styled-Components and utility CSS frameworks, these match top-level layout wrappers and will inadvertently hide entire sections of the page.
- Restrict styles strictly to native tags (`::cue`), player-specific containers (`[data-player]`, `.clappr-player`), and extension-controlled root classes (`html.dio-subtitles-disabled`).

### C. YouTube IFrame Player Communication
- Communicate with embedded YouTube players through the `postMessage` protocol:
  - Disable subtitles: `args: ['captions', 'track', {}]`
  - Enable subtitles: `args: ['captions', 'track', { languageCode: 'pt' }]`

---

## 4. UI & Styling

- Maintain a clean, responsive, and lightweight popup interface.
- Do not use emojis as functional UI icons; use clean SVGs or standard icon assets.
- Rely on standard CSS and CSS variables without adding third-party UI dependencies.
- Ensure all interactive controls have accessible labels and clear visual feedback states.

---

## 5. Documentation & Architecture Maintenance

- Keep `README.md` direct, concise, and focused on user value.
- **Tree Command Standard**: Whenever project files or directory structures are added, removed, or renamed, always run:
  ```bash
  tree -I ".git*|*.zip*"
  ```
  Use the exact terminal output to update the `## Estrutura do projeto` section in `README.md`.

---

## 6. Packaging and Release Standards (Flat Root ZIP)

- **Flat Archive Root**: Release `.zip` files must contain the extension files (`manifest.json`, `content/`, `popup/`, `icons/`, `README.md`, `LICENSE`, `AGENTS.md`) **directly at the root of the archive**, without an enclosing parent directory.
- **Windows Extraction Compatibility**: Built-in archive extractors (such as Windows "Extract All") create a folder matching the archive name. If the archive already contains a root folder, the resulting nested directory breaks Chrome's "Load unpacked" extension discovery (`manifest.json missing`).
- **Standard Packaging Command**:
  ```bash
  zip -r dio-remove-subtitles-vX.X.X.zip manifest.json content popup icons README.md LICENSE AGENTS.md
  ```

---

## 7. Git & Commit Standards

- Follow the **Conventional Commits** specification:
  - `feat:` for new capabilities.
  - `fix:` for bug fixes.
  - `docs:` for documentation updates.
  - `refactor:` for code restructuring without behavioral changes.
- Maintain a clean, linear commit history. Avoid committing temporary files, artifacts, or micro-commits.

---

## 8. Human-Computer Interaction (HCI) & Accessibility

- Uphold **Nielsen's Heuristic #3 (User Control and Freedom)**: Interfaces must provide straightforward mechanisms to toggle preferences and customize settings.
- Respect cognitive accessibility and neurodiversity: allow users to reduce visual clutter and split-attention effects to maintain focus.

---

## 9. AI Agent Verification Checklist

Before finalizing any task:
1. [ ] Check that all code comments are in English and only present where necessary.
2. [ ] Verify that no unhandled exceptions can break host SPA hydration.
3. [ ] Verify that CSS selectors are strictly scoped to player elements.
4. [ ] Run `tree -I ".git*|*.zip*"` and synchronize `README.md` if file structure changed.
5. [ ] Ensure release `.zip` packages are generated with a flat root structure.
6. [ ] Confirm that Git history remains clean, concise, and semantic.
