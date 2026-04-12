# AI Trend 1-Minute — Project Guide for Claude Code

This project is a React + Firebase web app that collects, summarizes, and shares AI trend news.

## Core Rules
- All frontend code **must** live inside `src/`
- Components go under `src/components/{role-based-folder}/`
- Add constants to `src/constants/index.js`
- When adding i18n keys, update **both** `src/locales/en.json` and `ko.json`
- Import Firebase functions from `src/firebaseConfig.js`
- Uses Tailwind CSS with a dark theme base (`bg-[#0f111a]`)

## Detailed Guides
See `.claude/skills/` for topic-specific references:
- `project-structure.md` — File structure & dependency graph
- `component-conventions.md` — Component writing rules & CSS patterns
- `firebase-patterns.md` — Auth/DB patterns & Firestore schema
- `build-and-deploy.md` — Build/deploy configuration
- `backend-pipeline.md` — Backend AI news pipeline
- `state-management.md` — State management & UI flow
