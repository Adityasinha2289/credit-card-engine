# Phase 17: Permanent Knowledge Base Index

Welcome to the RenoCred Knowledge Base. This directory contains the complete reverse-engineered architectural and product documentation for RenoCred.

## Table of Contents

### Part 1: Mental Model & Architecture
*   [01_Mental_Model](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/01_Mental_Model.md): Target users, core problems solved, and product maturity.
*   [02_Project_Structure](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/02_Project_Structure.md): Directory breakdown and dependency graphs.
*   [03_Entry_Flow](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/03_Entry_Flow.md): Execution trace from `main.tsx` to mount.
*   [04_Routing](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/04_Routing.md): URL vs State-based navigation.

### Part 2: Features & Relationships
*   [05_Feature_Deep_Dive](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/05_Feature_Deep_Dive.md): Analysis of every directory in `src/features/`.
*   [06_Component_Relationships](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/06_Component_Relationships.md): Component hierarchy and communication paths.

### Part 3: State & Data Lifecycle
*   [07_State_Flow](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/07_State_Flow.md): Global (Zustand), Local, and Derived state.
*   [08_Data_Flow](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/08_Data_Flow.md): Step-by-step trace of a transaction and an AI query.
*   [09_Backend_Understanding](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/09_Backend_Understanding.md): Supabase schema, RLS, and Vercel functions.

### Part 4: Systems, Logic & Decisions
*   [10_AI_Systems](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/10_AI_Systems.md): Deterministic Rule Engines vs Generative LLMs.
*   [11_Design_System](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/11_Design_System.md): The Anti-Gravity aesthetic (Tailwind variables).
*   [12_Dependency_Graph](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/12_Dependency_Graph.md): Visualizing module coupling and the God Store problem.
*   [13_Business_Logic](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/13_Business_Logic.md): Core rules for rewards, recommendations, and health scoring.
*   [14_Security](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/14_Security.md): Authentication boundaries, JWTs, and Environment Variables.
*   [15_Technical_Decisions](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/15_Technical_Decisions.md): Why Vite, React, Tailwind, Zustand, and Supabase were chosen.

### Part 5: Action Plan
*   [16_Rebuild_Readiness](file:///Users/aditya/Desktop/intern/kartik/credit-card-engine/docs/knowledge_base/16_Rebuild_Readiness.md): Categorization of what to Keep, Refactor, Rewrite, or Remove before V1 launch.

---

## Terminology Glossary
*   **FSD (Feature-Sliced Design)**: The architectural pattern used in `src/features/`.
*   **Anti-Gravity**: The internal name for the custom Tailwind design system (glass, glowing shadows).
*   **Taqdeer**: The conversational AI persona.
*   **Finix**: The internal codename for complex sub-panels (simulators, optimizers) lazy-loaded into the dashboard.
*   **Knowledge Graph**: The backend database (currently mocked) containing the universe of credit card multipliers and rules.
