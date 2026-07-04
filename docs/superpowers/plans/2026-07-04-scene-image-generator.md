# Scene Image Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a SillyTavern third-party extension that generates images from the current chat scene with configurable image API profiles.

**Architecture:** The extension is browser-only and installs as a normal SillyTavern UI extension. It stores settings under `extension_settings.sceneImageGenerator`, rewrites scene context through the current SillyTavern model by default, and routes image generation through provider modules.

**Tech Stack:** SillyTavern extension manifest, ES modules, plain HTML/CSS, OpenAI-compatible HTTP APIs.

---

### Task 1: Extension Shell

**Files:**
- Create: `manifest.json`
- Create: `index.js`
- Create: `style.css`

- [x] Create a third-party extension manifest with `index.js` and `style.css`.
- [x] Export an `init` hook from `index.js`.
- [x] Add settings-panel CSS without a build step.

### Task 2: Settings And Profiles

**Files:**
- Create: `src/settings.js`
- Create: `settings.html`

- [x] Store settings under `extension_settings.sceneImageGenerator`.
- [x] Add one default OpenAI-compatible image profile.
- [x] Add UI fields for multiple profiles, rewrite settings, and recent-turn count.

### Task 3: Scene Prompt Pipeline

**Files:**
- Create: `src/context.js`
- Create: `src/prompt-rewriter.js`

- [x] Collect recent non-system chat messages as scene text.
- [x] Use `generateQuietPrompt` for the default current-model rewrite path.
- [x] Add a custom OpenAI-compatible chat-completion rewrite path.

### Task 4: Image Provider Layer

**Files:**
- Create: `src/providers/index.js`
- Create: `src/providers/openai-compatible.js`

- [x] Route providers by `profile.provider`.
- [x] Implement OpenAI-compatible `/images/generations`.
- [x] Support both `b64_json` and `url` responses.

### Task 5: Documentation And Verification

**Files:**
- Create: `README.md`
- Create: `.gitignore`

- [x] Document install and profile configuration.
- [x] Run JavaScript syntax checks.
- [x] Initialize the folder as a Git repository if requested.
