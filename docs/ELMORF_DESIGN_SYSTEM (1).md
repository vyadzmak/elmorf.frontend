# Elmorf Design System

**Current internal version:** 1.0 Candidate — theme/i18n synchronized  
**Status:** Full first-pass candidate / cumulative working constitution  
**Product:** Elmorf  
**Scope:** Brand foundations + public website + authentication + application workspace + UI implementation layer  
**Primary goal:** maintain one canonical design document from concept through frontend implementation.

> **Canonical-document rule:** this file is cumulative. Future design iterations update this document in place. Version numbers describe the maturity of the same design system; they do not create independent design documents.

> **Theme rule:** Elmorf v1 supports **Light / Dark / System from Phase 1**. Dark is the canonical brand reference, but Light is a production-supported theme. Any earlier `dark-only` wording is superseded and removed.

### Revision log

| Version | Scope added |
|---|---|
| 0.1 | Product anatomy, brand character, palette, logo semantics, layout philosophy, core product surfaces, Morphology principles, mock-first frontend direction |
| 0.2 | shadcn-first implementation layer, semantic tokens, component ownership, dimensions, control metrics, component matrix, layout contracts and implementation rules |
| 1.0 Candidate | Full product/design pass: mandatory Radix base, complete screens and states, graph language, responsive/accessibility, mock language, Storybook/QA and design-freeze criteria; Light/Dark/System and Appearance synchronized with frontend specification |

---

## 1. Product anatomy

Elmorf is not designed as a large enterprise suite. It is a focused developer/data tool that compiles messy, inconsistent source data into a structured, queryable Compiled Model.

### Public surface

```text
elmorf.com
├── Landing
└── Try

app.elmorf.com
├── /login
└── /signup
```

### Application surface

```text
app.elmorf.com
└── Project
    ├── Overview
    ├── Data
    ├── Compile
    ├── Morphology
    │   ├── Graph
    │   ├── Objects
    │   └── Relations
    ├── Query
    └── Settings
```

### Core user journey

```text
Understand Elmorf
      ↓
See how little code is required
      ↓
Try a prepared model
      ↓
Create account
      ↓
Create/open project
      ↓
Add data
      ↓
Compile
      ↓
Inspect morphology
      ↓
Query compiled model
      ↓
Use the same model through SDK/API
```

---

## 2. Product character

Elmorf should feel like a **precise engineering instrument**.

It must not feel like:
- a generic AI assistant;
- an enterprise admin panel;
- a BI dashboard;
- a terminal cosplay product;
- a Web3/blockchain product;
- a decorative “future tech” website.

### Desired qualities

- precise;
- calm;
- dense when useful;
- restrained;
- industrial;
- technical;
- trustworthy;
- fast;
- intentional;
- low-noise.

### Core visual principle

> **Structure over decoration.**

Every visible element must either:
1. explain state;
2. enable an action;
3. expose structure;
4. preserve orientation;
5. improve readability.

If it does none of these, it probably should not exist.

---

## 3. Brand system

### 3.1 Brand palette

#### Base

| Role | Color | Value |
|---|---|---|
| Main background | Deep graphite | `#111315` |
| Surface / cards | Dark slate | `#171A1D` |
| Elevated surface | Raised slate | `#1D2125` |
| Primary text | Soft off-white | `#E8E6E3` |
| Secondary text | Muted gray | `#A6A19A` |
| Borders / dividers | Charcoal gray | `#2A2F34` |

#### Accent

| Role | Color | Value |
|---|---|---|
| Primary accent | Brass / amber | `#C89B45` |
| Accent hover | Bright amber | `#D6A957` |
| Muted accent | Dark brass | `#8A6A2F` |
| Soft accent background | Amber tint | `rgba(200,155,69,0.12)` |

#### Semantic state

| Role | Value |
|---|---|
| Success / compiled | `#D8C28A` or primary accent where appropriate |
| Warning / conflict | `#E0A93B` |
| Error | `#B85C4A` |

### 3.2 Accent discipline

Amber must be **rare**.

Use amber primarily for:
- active navigation;
- primary action;
- current selection;
- selected graph object;
- current compile state;
- meaningful emphasis;
- focus accents where appropriate.

Do not use amber:
- on every icon;
- on every metric;
- as decorative fill;
- for large page backgrounds;
- to make otherwise weak hierarchy visible.

If more than roughly 10–15% of a working screen visually reads as amber, the hierarchy is probably broken.

---

## 4. Logo

### 4.1 Primary mark

The primary Elmorf mark is the **broken square**.

The square represents:
- structure;
- stable form;
- model boundary;
- canonical object;
- compiled state.

The gap represents:
- incoming information;
- an open model;
- incomplete evidence;
- the ability of structure to evolve;
- the fact that Elmorf derives boundaries instead of assuming them.

### 4.2 Brand interpretation

A concise internal interpretation:

> **Structure from incomplete information.**

Alternative product interpretation:

> Unstructured in. Structured out.

### 4.3 Mascot

The wombat is **not the Elmorf logo**.

The wombat may be used as:
- mascot;
- workstation personality;
- developer easter egg;
- merchandise art;
- documentation illustration;
- occasional empty-state character.

Never use the wombat where the primary Elmorf identity is required.

### 4.4 Logo rules

The mark must:
- remain geometric;
- remain flat;
- contain no gradients;
- contain no shadows;
- contain no 3D treatment;
- remain recognizable at favicon size;
- be drawable by hand in approximately 10–15 seconds.

---

## 5. Visual prohibitions

Elmorf should explicitly avoid:

- gradients;
- glassmorphism;
- neon glow;
- oversized blurred blobs;
- AI sparkle iconography as a design theme;
- brain imagery;
- neural-network wallpaper;
- random animated particles;
- decorative graph networks;
- excessive rounded pills;
- glossy 3D icons;
- skeuomorphic surfaces;
- massive shadows;
- huge dashboard cards with little information;
- animation that exists only to look “premium”;
- fake terminal aesthetics.

No design decision should be justified only by “it looks futuristic”.

---

## 6. Typography

### Proposed family

**Primary:** Geist Sans  
**Technical / monospace:** Geist Mono

### Usage

Geist Sans:
- navigation;
- page titles;
- body text;
- buttons;
- forms;
- tables;
- labels.

Geist Mono:
- object IDs;
- hashes;
- run IDs;
- timestamps where precision matters;
- latency;
- code;
- raw values;
- API responses;
- schema fields;
- technical metadata.

### Suggested type scale

| Token | Size | Weight | Use |
|---|---:|---:|---|
| Display | 48–64 | 500–600 | Landing hero only |
| H1 | 28–32 | 600 | Application page title |
| H2 | 20–24 | 600 | Major sections |
| H3 | 16–18 | 600 | Panels / sub-sections |
| Body | 14 | 400 | Main UI text |
| Body small | 13 | 400 | Dense interfaces |
| Label | 12 | 500 | Metadata / controls |
| Caption | 11 | 400 | Secondary metadata |
| Metric | 24–32 | 500–600 | Primary numeric values |

### Rules

- Avoid excessive bold.
- Numeric data should align visually.
- Avoid tiny text below 11 px.
- Tables should default to 13–14 px.
- Page titles should be restrained; the workspace is not a marketing page.

---

## 7. Spacing

Base unit: **4 px**

Preferred scale:

```text
4
8
12
16
20
24
32
40
48
64
```

### Density philosophy

Elmorf has two density modes conceptually:

**Presentation density**
- landing;
- auth;
- empty states.

**Working density**
- data tables;
- morphology;
- query;
- compile logs.

Working screens should not waste vertical space to imitate consumer SaaS.

---

## 8. Geometry

### Border radius

Recommended:
- small controls: `6px`;
- common controls/cards: `8px`;
- large containers: `10px`;
- modal/dialog max: `12px`.

Avoid:
- excessive `16–24px` card rounding;
- pill-shaped containers unless the component is actually a chip/tag/status.

### Borders

Primary border:
`1px solid #2A2F34`

Selected border:
accent-based, used sparingly.

### Shadows

Shadows should be minimal.

Hierarchy should primarily come from:
1. background;
2. surface elevation;
3. border;
4. spacing.

Not from large floating shadows.

---

## 9. Surface hierarchy

```text
Level 0  #111315  application/background
Level 1  #171A1D  standard surface
Level 2  #1D2125  elevated / interactive surface
```

A page should rarely need more than these three depth levels.

Avoid nesting five visual cards inside each other.

---

## 10. Application shell

### Desktop-first philosophy

Elmorf is primarily a working tool.

Primary target widths:
- 1920;
- 1600;
- 1440;
- 1280.

Tablet support is desirable.

Mobile support should prioritize:
- account;
- basic status;
- simple inspection.

The full Morphology workbench does not need to pretend that a phone is an optimal graph-analysis environment.

### Main shell

```text
┌──────────────────────────────────────────────────────────────┐
│ Top bar                                                      │
├───────────────┬───────────────────────────────┬──────────────┤
│               │                               │              │
│ Sidebar       │ Workspace                     │ Inspector    │
│               │                               │ optional     │
│               │                               │ contextual   │
└───────────────┴───────────────────────────────┴──────────────┘
```

### Inspector

The inspector is contextual.

It should appear for:
- selected graph object;
- selected source;
- selected compilation;
- selected query result.

It should not permanently consume screen space when it contains nothing useful.

Resizable panels should be supported where appropriate.

---

## 11. Navigation

### Primary sidebar

```text
[ Elmorf ]

[ Project switcher ▾ ]

Overview

Data
Compile
Morphology
Query

────────────

Settings
```

The sidebar should remain intentionally small.

Do not create new top-level sections unless the concept cannot reasonably live inside an existing one.

### Why there is no “Runs”

“Runs” currently duplicates concepts already owned by:
- Data processing;
- Compilation history.

If Elmorf later develops many unrelated background operations, consider an **Activity** surface.

Do not create an abstract top-level page for a concept whose product meaning is not yet clear.

---

## 12. Project model

A Project is the primary application scope.

Examples:
- contracts;
- CRM export;
- HR corpus;
- product catalog;
- research dataset.

Conceptually:

```text
Account
└── Project
    ├── Data
    ├── Compilations
    ├── Compiled Model
    └── Queries
```

The current project should always be visible and easy to switch.

---

## 13. Global system state

The application should expose a small global status in the top bar.

Examples:

```text
● Ready
◐ Processing
◐ Compiling
! Attention
```

Opening it should reveal current background state, for example:

```text
Data processing     2 running
Compilation         v18 running
Current model       v17
```

A user should be able to answer:

> “What is Elmorf doing right now?”

from any working screen.

---

## 14. Overview

Purpose:

> Provide the current pulse of the project.

It is not a BI dashboard.

Recommended content:

```text
Sources
Compiled objects
Relations
Conflicts
Current model
Last compilation
```

Possible health rows:

```text
Data processing
Compilation
Model
API
```

Allow only a small number of genuinely useful charts.

Avoid decorative metrics and dashboard-card spam.

---

## 15. Data

UI label: **Data**

Technical concepts may still use “ingest” internally or in SDK/API naming.

Purpose:
- add source data;
- see all sources;
- inspect processing;
- retry/cancel where applicable;
- understand readiness.

Primary action:

```text
+ Add data
```

Suggested views:

```text
All
Processing
Ready
Failed
```

The user should not have to visit separate pages for upload and processing status.

Example information architecture:

```text
Data
├── Sources
├── Upload / Add data
└── Processing state
```

---

## 16. Compile

Purpose:

> Build a new version of the Compiled Model and understand exactly what happened.

Primary information:

```text
Current model
Source count
Object count
Relation count
Conflict count
Last compilation
```

Primary action:

```text
Compile new version
```

Compilation stage visualization may include:

```text
Bones
Flesh
Compile
```

With:
- state;
- elapsed time;
- warnings;
- errors;
- logs;
- cancel where valid.

Compilation history belongs here.

---

## 17. Morphology

Morphology is the primary model exploration workspace.

It combines three projections of the same compiled world:

```text
Graph
Objects
Relations
```

Possible future projection:

```text
Conflicts
```

These are not separate product domains.

They are alternate ways of examining one Compiled Model.

### Morphology principle

> The user should never feel that Graph, Objects and Relations are disconnected datasets.

Selection, filtering and identity should remain consistent across views whenever practical.

---

## 18. Morphology: Graph language

The graph is functional, not decorative.

### Graph must support

- pan;
- zoom;
- fit;
- search;
- type filters;
- relation filters;
- select;
- multi-select where useful;
- contextual inspector;
- neighbour highlighting;
- expansion;
- collapse;
- clustering;
- level-of-detail;
- clear selected state;
- clear hidden/faded state.

### Node semantics

Node appearance may encode:
- entity/object type;
- selected state;
- confidence;
- conflict;
- canonical/stable state.

Avoid encoding five dimensions simultaneously.

### Selected node

The selected object should be the clearest visual anchor in the graph.

Neighbouring nodes may remain emphasized.

Unrelated nodes may fade rather than disappear.

### Edges

Edges should:
- be visually secondary to nodes;
- expose direction where direction matters;
- expose labels only when readable/useful;
- avoid turning the canvas into spaghetti.

### Graph anti-patterns

Do not:
- show every label at every zoom level;
- show every edge at full strength;
- animate all nodes;
- use random node colors;
- use glow as the primary selection state.

---

## 19. Morphology: Objects

Objects view is a dense table projection of the same model.

Typical columns:

```text
Type
Identity
Confidence
Relations
Updated
```

Selection should open the same object inspector used by Graph.

Tables must support:
- sorting;
- filtering;
- virtualized large lists;
- column visibility;
- keyboard navigation where practical;
- sticky header.

---

## 20. Morphology: Relations

Relations view is a relation-centric projection.

Example:

```text
FROM          RELATION       TO
Acme Corp     SIGNED         Contract #14
John Smith    WORKS_FOR      Acme Corp
Invoice #31   BELONGS_TO     Contract #14
```

The visual language should clearly distinguish:
- source;
- predicate/relation;
- target.

Selecting a relation should expose:
- identity;
- evidence;
- confidence;
- connected objects.

---

## 21. Query

Query is a first-class product surface.

It should behave as a serious developer/data playground, not a chat window.

### Query anatomy

```text
Model selector
Query editor
Run action

Result
Execution metadata
Evidence
```

### Result representations

Where applicable:

```text
JSON
Table
Graph
```

### Important principle

The UI should teach the programmatic interface.

A query executed in the UI should be convertible into:
- Python SDK;
- HTTP API / curl;
- potentially TypeScript SDK later.

This creates one mental model across UI and API.

---

## 22. Landing

The landing page should be informative but compact.

### Landing goals

Answer quickly:
1. What is Elmorf?
2. Why does it exist?
3. Who needs it?
4. What does it produce?
5. How little code is required?
6. Can I try it?

### Recommended structure

```text
Hero
What Elmorf is
How it works
SDK demonstration
Use cases
Try Elmorf
Footer
```

Avoid:
- 20 marketing sections;
- generic enterprise claims;
- inflated AI language;
- fake customer metrics;
- decorative illustrations with no product meaning.

### Hero direction

Large but restrained.

Example communication pattern:

```text
Compile messy data
into a consistent model.
```

Supporting explanation should immediately explain the Compiled Model.

---

## 23. Landing SDK demonstration

This is a central landing element.

The demonstration should visually connect:

```text
code
↓
processing
↓
compiled structure
```

Example conceptual flow:

```python
pip install elmorf

elmorf.load(...)
elmorf.compile(...)
elmorf.get(...)
```

The exact SDK syntax is not fixed by this design document.

The visual demonstration should preferably show:
- code on one side;
- changing structured result on the other;
- document count;
- object count;
- relation count;
- a compact graph or structured object result.

Avoid a generic fake terminal typing animation with no meaningful product feedback.

---

## 24. Try

Route:

```text
elmorf.com/try
```

Should work without account creation using a prepared corpus/model.

The user should be able to:
- trigger or observe a small compile;
- inspect objects;
- inspect relations;
- open a graph;
- run a few queries;
- inspect evidence.

The natural CTA afterward:

```text
Compile your own data
Create account →
```

---

## 25. Authentication

Routes:

```text
app.elmorf.com/login
app.elmorf.com/signup
```

Public terminology:
- Sign in;
- Create account.

The authentication experience should be extremely restrained.

Recommended characteristics:
- logo;
- heading;
- form;
- optional OAuth;
- no decorative illustration;
- no marketing carousel;
- no gradient background.

Authentication should feel like entry into a professional tool.

---

## 26. Icons

Recommended base icon family:

**Lucide**

### Rules

- default UI size: 16 px;
- common range: 14 / 16 / 18 / 20 / 24;
- consistent stroke weight;
- icon-only actions require tooltip;
- use labels when ambiguity exists.

Custom Elmorf icons should only be introduced for genuinely product-specific concepts.

Do not create a parallel custom icon system merely for visual novelty.

---

## 27. Controls

Base controls should feel compact and precise.

### Button hierarchy

- Primary
- Secondary
- Ghost
- Destructive

Primary should be used sparingly.

A screen should usually have one obvious primary action.

### Inputs

Inputs should:
- have strong focus visibility;
- avoid oversized heights;
- preserve dense desktop productivity;
- use explicit labels when ambiguity exists.

---

## 28. Status language

Common states should have consistent names.

Examples:

```text
Ready
Processing
Compiling
Completed
Failed
Cancelled
Warning
Conflict
```

Avoid synonyms for the same state in different sections.

A state should not rely on color alone.

Use:
- text;
- icon;
- color.

---

## 29. Motion

Motion exists to explain change.

### Recommended duration bands

```text
Fast        100–150ms
Standard    150–220ms
Panel       200–300ms
```

Use motion for:
- menu transitions;
- panel appearance;
- selection;
- reordering;
- graph focus;
- state transitions.

Avoid:
- idle looping effects;
- decorative floating elements;
- animated backgrounds;
- gratuitous entrance animation for every card.

Respect reduced-motion preferences.

---

## 30. Data visualization

Charts are supporting instruments, not decoration.

Rules:
- use charts only when they explain a pattern better than a number/table;
- prefer restrained palettes;
- amber highlights the important series, not every series;
- avoid 3D charts;
- avoid rainbow categorical schemes where possible;
- always retain textual/accessible values.

Overview should remain a pulse, not become a BI product.

---

## 31. Empty states

Empty states should explain the next action.

Bad:

```text
No data
```

Better:

```text
No sources yet.

Add files or connect a source to create your first compiled model.

[ Add data ]
```

Mascot usage may be tested here, but the product must still work visually without mascot illustration.

---

## 32. Loading states

Prefer:
- skeletons for predictable content;
- explicit progress where measurable;
- activity status for background jobs.

Do not use blocking full-screen spinners for operations that can continue in the background.

Compilation should expose meaningful progress when known.

---

## 33. Errors

Error design should answer:
1. what failed;
2. what is affected;
3. what the user can do;
4. whether existing compiled data remains usable.

Errors should be specific.

Avoid generic:
- “Something went wrong”;
- “Unknown error”;
- “Try again later” without context.

Technical details may be expandable.

---

## 34. Interaction hierarchy

Preferred interaction hierarchy:

```text
Primary action
Secondary action
Context action
Dangerous action
```

Dangerous actions should be visually separated from routine actions.

Context menus should not hide actions that users need constantly.

---

## 35. URL and navigation state

Shareable working state should use the URL where sensible.

Examples:
- project;
- morphology view;
- object ID;
- query ID;
- filters that users reasonably expect to bookmark/share.

Ephemeral UI state belongs in local state.

Do not encode every hover/panel pixel into the URL.

---

## 36. Accessibility baseline

Elmorf should support:
- visible keyboard focus;
- keyboard navigation for standard controls;
- minimum practical contrast;
- semantic landmarks;
- reduced motion;
- accessible labels;
- status text in addition to color;
- table semantics;
- non-graph fallback access to model data.

The graph must never be the only way to access an object or relation.

---

## 37. Design implementation philosophy

The design system should be **code-first**.

**shadcn/ui is the mandatory base component framework for Elmorf.** It is not optional, not a temporary scaffold, and not something to replace with a parallel component library. Elmorf-specific components should be composed from, extended from, or stylistically aligned with shadcn primitives wherever practical.

The canonical implementation should ultimately live in:
- design tokens;
- Tailwind variables;
- shadcn/ui components and Elmorf extensions built on top of them;
- Storybook;
- reusable layout primitives.

### shadcn rules

- Prefer shadcn primitives before introducing a custom primitive.
- Prefer composition over forking component behavior.
- Do not introduce a second general-purpose UI kit alongside shadcn.
- Custom Elmorf visuals are encouraged where the product needs a distinct language, but they must remain compatible with the shadcn/Tailwind token system.
- The goal is not to preserve the default shadcn look; the goal is to use shadcn as the structural base while making the resulting product unmistakably Elmorf.

A static document describes the rules, but production components are the final source of truth.

---

## 38. Initial technical mapping

Frontend foundation:

```text
Next.js
React
TypeScript strict
Tailwind CSS
shadcn/ui — mandatory base UI framework
Zod
react-hook-form

TanStack Query
TanStack Table
TanStack Virtual

Zustand

Sigma.js
Graphology
ForceAtlas2 / worker-based graph layout

React Flow only for editable node/flow experiences where appropriate

dnd-kit
react-resizable-panels
Recharts
Lucide
Motion
Sonner

MSW
Faker

Storybook
Vitest
Testing Library
Playwright
```

### State ownership

```text
Server/API/cache state → TanStack Query

Local persistent workspace/UI state → Zustand

Shareable navigation/filter state → URL/search params

Form state → React Hook Form + Zod
```

Do not duplicate server state into Zustand by default.

---

## 39. Mock-first architecture

The first Elmorf frontend should be a real frontend against a fake backend, not a throwaway static prototype.

Preferred flow:

```text
UI
 ↓
query/mutation hook
 ↓
typed API client
 ↓
HTTP
 ↓
MSW
 ↓
fixtures / generated mock data
```

Later:

```text
MSW off
 ↓
real Elmorf API
```

UI components should not import raw mock fixture files directly.

This allows the design prototype to evolve into the actual product without rewriting every screen.

---

## 40. Primary design validation screen

The first major working screen used to validate the system should be:

> **Morphology / Graph**

Why:
- sidebar;
- topbar;
- search;
- filters;
- graph;
- inspector;
- tabs;
- badges;
- technical metadata;
- selection states;
- resizable panels;
- density;
- loading;
- empty state;
- context actions.

If Morphology looks and feels distinctly Elmorf, most other application surfaces will inherit a coherent language.

---

## 41. Definition of “looks like Elmorf”

A screen should still feel like Elmorf if:
- the wordmark is removed;
- the mascot is removed;
- the primary logo is removed.

The identity should survive through:
- graphite surface hierarchy;
- restrained brass accent;
- typography;
- density;
- border geometry;
- graph language;
- interaction behavior;
- information hierarchy.

If a screen becomes indistinguishable from a default shadcn dashboard after removing the logo, the design system is not strong enough yet. This must hold in both Dark and Light themes.

---

## 42. Earlier open questions — resolution status

The initial foundation questions have been resolved by the full 1.0 Candidate pass. The current authoritative unresolved list is **Section 166: Open questions remaining after full pass**.

Resolved in this document:
- typography baseline;
- logo construction baseline;
- sidebar behavior;
- topbar anatomy;
- inspector sizing;
- breakpoint strategy;
- Morphology navigation;
- graph default visual semantics;
- query modes;
- onboarding direction;
- Light / Dark / System strategy;
- semantic token architecture.

Still intentionally deferred are only the small items listed in Section 166.

---

## 43. Foundation conclusion

Elmorf should look like a **compiled structure itself**:

- restrained;
- legible;
- geometric;
- low-noise;
- dense where work happens;
- open where explanation matters;
- consistent across UI and API mental models.

The product should visually communicate:

> **This is not an AI toy. This is an instrument for turning uncertain data into usable structure.**
---

# 44. shadcn implementation layer

This section defines how Elmorf's visual language maps onto shadcn.

## 44.1 Foundation decision

Elmorf uses **shadcn/ui as the base UI framework**.

The project must use:
- current shadcn CLI conventions;
- **Radix UI as the mandatory primitive layer**;
- shadcn components generated for the `radix` base;
- the `new-york` style family as the initial compact shadcn baseline;
- semantic CSS variables;
- Tailwind CSS;
- Lucide as the baseline icon library;
- `neutral` as the generation base color, with Elmorf tokens replacing the visual identity.

**Base UI is not used as the primitive foundation for Elmorf. Do not mix Base UI and Radix primitives inside the same design system.**

If Radix already implements interaction semantics (focus management, keyboard navigation, portals, dismissal, ARIA, menu/select/dialog behavior), Elmorf must compose or style that behavior rather than recreating it with custom DOM/state/listeners.

`new-york` is only a compact implementation starting point. It is **not the Elmorf visual identity**. The final appearance is controlled by Elmorf tokens and component rules defined in this document.

## 44.2 Ownership rule

Generic interface primitives belong to shadcn:

```text
Button
Input
Textarea
Select
Checkbox
Radio Group
Switch
Tabs
Tooltip
Popover
Dropdown Menu
Context Menu
Command
Dialog
Alert Dialog
Sheet
Drawer
Badge
Separator
Breadcrumb
Table
Skeleton
Progress
Scroll Area
Resizable
Sonner / Toast
Sidebar
```

Elmorf should not rewrite these from scratch merely to make them look custom.

Product-specific components belong to Elmorf:

```text
ProjectSwitcher
GlobalSystemStatus
SourceStatus
SourceTable
CompilationStatus
CompilationPipeline
ModelVersionBadge
MorphologyToolbar
MorphologyCanvas
MorphologyObjectNode
MorphologyRelationEdge
ObjectInspector
RelationInspector
EvidenceList
QueryEditor
QueryResultViewer
ModelHealth
CompileAction
```

Product-specific components may internally compose several shadcn primitives.

### Radix behavior ownership

Use Radix/shadcn behavior first for `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Tabs`, `Collapsible`, `Accordion` and related accessible primitives.

Do not replace them with `div + useState + event listeners` unless a documented technical limitation makes the Radix primitive unsuitable.

## 44.3 Modification rule

Prefer customization in this order:

1. semantic token change;
2. existing shadcn variant;
3. new Elmorf variant using `class-variance-authority`;
4. wrapper/composition around shadcn;
5. controlled modification of the copied shadcn source;
6. completely custom primitive only when technically justified.

Do not jump directly to step 6.

---

# 45. Semantic token architecture

Raw HEX values are brand-source values.

Application components should consume **semantic tokens**, not raw brand colors.

Bad:

```tsx
<div className="bg-[#171A1D] border-[#2A2F34] text-[#E8E6E3]" />
```

Preferred:

```tsx
<div className="bg-card border-border text-card-foreground" />
```

## 45.1 Core shadcn token mapping

| shadcn token | Elmorf role | Source |
|---|---|---|
| `background` | Main application background | `#111315` |
| `foreground` | Primary text | `#E8E6E3` |
| `card` | Standard surface | `#171A1D` |
| `card-foreground` | Primary text on card | `#E8E6E3` |
| `popover` | Elevated surface | `#1D2125` |
| `popover-foreground` | Primary text | `#E8E6E3` |
| `primary` | Brass primary action/accent | `#C89B45` |
| `primary-foreground` | Dark text on brass | near-black derived token |
| `secondary` | Elevated neutral interactive surface | `#1D2125` |
| `secondary-foreground` | Primary text | `#E8E6E3` |
| `muted` | Low-emphasis surface | graphite/slate derived |
| `muted-foreground` | Secondary text | `#A6A19A` |
| `accent` | Soft brass selection/hover surface | amber tint |
| `accent-foreground` | Active/selected text | off-white or brass according to component |
| `destructive` | Destructive state | `#B85C4A` |
| `border` | Standard divider/border | `#2A2F34` |
| `input` | Input border | `#2A2F34` |
| `ring` | Focus indication | `#C89B45` |

## 45.2 Elmorf extension tokens

In addition to shadcn semantic tokens, define explicit product tokens.

```text
--elmorf-surface-0
--elmorf-surface-1
--elmorf-surface-2

--elmorf-brass
--elmorf-brass-hover
--elmorf-brass-muted
--elmorf-brass-soft

--elmorf-success
--elmorf-warning
--elmorf-error

--elmorf-graph-node
--elmorf-graph-node-muted
--elmorf-graph-node-selected
--elmorf-graph-edge
--elmorf-graph-edge-muted
--elmorf-graph-edge-selected

--elmorf-inspector
--elmorf-code-surface
```

These tokens exist only when the semantic role is genuinely Elmorf-specific.

Do not create aliases for every raw color.

## 45.3 Theme strategy — Light / Dark / System

Elmorf v1 supports three theme modes **from Phase 1**:

```text
Light
Dark
System
```

Rules:

- **Dark** is the canonical Elmorf brand reference and the primary visual benchmark.
- **Light** is a fully supported production theme, not a deferred feature.
- **System** follows the operating-system preference.
- Default behavior is `system`.
- All generic and Elmorf-specific semantic color tokens must have Light and Dark values.
- Feature components must never hard-code Dark palette values.
- Light is not a mechanical inversion of Dark; it is a warm neutral companion theme that preserves Graphite + Brass semantics.
- Meaning never changes between themes: brass remains primary/selected, warning remains warning, destructive remains destructive.

If a visual decision is ambiguous, Dark is the reference for **brand character**, while both themes remain acceptance requirements.

## 45.4 Theme implementation contract

Implementation uses `next-themes` through the shared UI package.

Required modes:

```text
light
dark
system
```

Required behavior:
- theme survives reload;
- System reacts to OS preference;
- no incorrect-theme flash on first paint;
- SSR/hydration does not produce visible mismatch;
- graph, charts and code surfaces update correctly after theme switch;
- reduced motion / theme switching must not introduce decorative transitions.

The user controls this from:

```text
Settings → Appearance → Theme
```

---

# 46. Proposed token values

These values are the initial implementation baseline and may be tuned visually.

`Dark` remains the canonical Graphite + Brass reference. `Light` is a warm companion palette, not an inversion.

```css
:root {
  --background: #F4F2EE;
  --foreground: #191B1D;

  --card: #FAF9F6;
  --card-foreground: #191B1D;

  --popover: #FFFFFF;
  --popover-foreground: #191B1D;

  --primary: #C89B45;
  --primary-foreground: #151719;

  --secondary: #ECE9E3;
  --secondary-foreground: #24272A;

  --muted: #ECE9E3;
  --muted-foreground: #6F6A63;

  --accent: rgba(154, 111, 35, 0.12);
  --accent-foreground: #191B1D;

  --destructive: #A94F40;

  --border: #D6D1C8;
  --input: #C9C3B9;
  --ring: #9A6F23;

  --elmorf-brass: #C89B45;
  --elmorf-brass-hover: #B9862E;
  --elmorf-brass-muted: #9A6F23;
  --elmorf-brass-soft: rgba(154, 111, 35, 0.12);

  --elmorf-success: #8B7438;
  --elmorf-warning: #A87414;
  --elmorf-error: #A94F40;

  --elmorf-graph-node: #FFFFFF;
  --elmorf-graph-node-muted: #ECE9E3;
  --elmorf-graph-node-selected: #C89B45;
  --elmorf-graph-edge: #CBC5BC;
  --elmorf-graph-edge-muted: #DDD8D0;
  --elmorf-graph-edge-selected: #9A6F23;

  --radius: 0.5rem;
}

.dark {
  --background: #111315;
  --foreground: #E8E6E3;

  --card: #171A1D;
  --card-foreground: #E8E6E3;

  --popover: #1D2125;
  --popover-foreground: #E8E6E3;

  --primary: #C89B45;
  --primary-foreground: #111315;

  --secondary: #1D2125;
  --secondary-foreground: #E8E6E3;

  --muted: #171A1D;
  --muted-foreground: #A6A19A;

  --accent: rgba(200, 155, 69, 0.12);
  --accent-foreground: #E8E6E3;

  --destructive: #B85C4A;

  --border: #2A2F34;
  --input: #2A2F34;
  --ring: #C89B45;

  --elmorf-brass: #C89B45;
  --elmorf-brass-hover: #D6A957;
  --elmorf-brass-muted: #8A6A2F;
  --elmorf-brass-soft: rgba(200, 155, 69, 0.12);

  --elmorf-success: #D8C28A;
  --elmorf-warning: #E0A93B;
  --elmorf-error: #B85C4A;

  --elmorf-graph-node: #1D2125;
  --elmorf-graph-node-muted: #171A1D;
  --elmorf-graph-node-selected: #C89B45;
  --elmorf-graph-edge: #343A40;
  --elmorf-graph-edge-muted: #24282D;
  --elmorf-graph-edge-selected: #C89B45;

  --radius: 0.5rem;
}
```

This block is a semantic starting point, not an excuse to use raw values elsewhere.

Before production, color contrast must be verified for actual text/control pairings in **both** themes.

---

# 47. Sidebar token mapping

Use the shadcn Sidebar component as the structural base.

Suggested mapping:

```css
:root {
  --sidebar: #F4F2EE;
  --sidebar-foreground: #6F6A63;
  --sidebar-primary: #C89B45;
  --sidebar-primary-foreground: #151719;
  --sidebar-accent: rgba(154, 111, 35, 0.12);
  --sidebar-accent-foreground: #191B1D;
  --sidebar-border: #D6D1C8;
  --sidebar-ring: #9A6F23;
}

.dark {
  --sidebar: #111315;
  --sidebar-foreground: #A6A19A;
  --sidebar-primary: #C89B45;
  --sidebar-primary-foreground: #111315;
  --sidebar-accent: rgba(200, 155, 69, 0.12);
  --sidebar-accent-foreground: #E8E6E3;
  --sidebar-border: #2A2F34;
  --sidebar-ring: #C89B45;
}
```

## 47.1 Desktop sidebar behavior

Initial decision:

- desktop sidebar is **persistent**;
- default width: `232px`;
- do not collapse to icon-only mode in v1;
- mobile/tablet may use shadcn's off-canvas behavior;
- Project Switcher lives in `SidebarHeader`;
- Settings and account-related utility actions live near `SidebarFooter`;
- primary navigation lives in `SidebarContent`.

Reason:

Elmorf currently has very few top-level sections. Icon-only collapsing would reduce clarity while recovering very little useful space.

The implementation may retain shadcn's provider architecture even though icon-collapse is disabled on desktop.

---

# 48. App shell dimensions

Initial geometry:

```text
Desktop sidebar        232px
Topbar                 52px
Inspector default      392px
Inspector minimum      320px
Inspector maximum      520px
Workspace minimum      560px
```

These are baseline values, not arbitrary magic numbers scattered through components.

They should become layout constants/tokens.

## 48.1 Shell contract

```text
viewport
├── sidebar
└── app column
    ├── topbar
    └── workspace row
        ├── main workspace
        └── optional inspector
```

The topbar belongs to the application shell, not to every page independently.

The inspector is part of the workspace shell and receives contextual content from the active route/view.

---

# 49. Topbar anatomy

Default desktop topbar:

```text
[ context / page identity ]       [ global utility area ]
```

Candidate utility area:

```text
Search / Command
Global System Status
Help / Docs
User Menu
```

Do not fill the topbar merely because horizontal space exists.

## 49.1 Breadcrumbs

Breadcrumbs are not globally mandatory.

Use them only when they materially improve orientation.

Examples where breadcrumbs may be useful:

```text
Data / contracts.zip
Morphology / Object / Acme Corp
Compile / v18
```

Do not show:

```text
Home / Project / Morphology
```

on every screen just because a breadcrumb component exists.

---

# 50. Control metrics

Initial desktop working-density metrics:

| Control | Height |
|---|---:|
| Small button | 28px |
| Standard button | 32px |
| Large/public CTA | 40px |
| Standard input | 32px |
| Search / combobox | 32px |
| Compact table row | 32px |
| Standard table row | 36px |
| Topbar | 52px |
| Tabs row | 36–40px |

Landing controls may intentionally be larger than workspace controls.

Application controls should not default to consumer-mobile sizing.

---

# 51. Component radius rules

Use the shadcn radius scale, driven from:

```text
--radius: 8px
```

Target visual outcomes:

```text
small control        ~5–6px
standard control     ~6–8px
card                 ~8px
dialog               ~10–12px
pill                 only when semantically pill-shaped
```

A Badge may be pill-like.

A 900px-wide panel should not look like a giant rounded bubble.

---

# 52. Focus language

Keyboard focus must be highly visible without becoming neon.

Default:
- brass ring;
- thin;
- consistent;
- separated from selected-state semantics where possible.

Do not remove shadcn focus behavior merely because a mouse screenshot looks cleaner without it.

Hover is not focus.

Selected is not focus.

Active/pressed is not focus.

These are separate states.

---

# 53. Button system

Base: shadcn `Button`.

Required Elmorf variants:

```text
primary
secondary
outline
ghost
destructive
```

Potential product-specific variant:

```text
compile
```

Only introduce `compile` if it has behavior/semantics beyond being a primary button.

## 53.1 Primary

Use for the most important local action:

```text
Add data
Compile new version
Run query
Create project
```

The primary button normally uses brass.

Avoid multiple brass primary buttons fighting within one visual region.

## 53.2 Secondary

Neutral graphite/slate surface.

Use for:
- supporting actions;
- alternate flows;
- non-primary confirmations.

## 53.3 Ghost

Use for:
- compact toolbar actions;
- icon actions;
- secondary navigation utilities.

Icon-only ghost buttons require tooltips.

## 53.4 Destructive

Use muted brick red.

Destructive actions must not use brass.

---

# 54. Input system

Base:
- shadcn `Input`;
- shadcn `Textarea`;
- shadcn `Select`;
- shadcn `Combobox` composition;
- React Hook Form + Zod for form ownership.

Application inputs should:
- default to 32px working height;
- use subtle input/border contrast;
- gain a brass focus ring;
- never rely only on placeholder text as a label for important forms.

Query/editor surfaces are not standard textareas and receive their own component treatment.

---

# 55. Tabs

Base: shadcn `Tabs`.

Elmorf default application tabs should be low-noise.

Preferred visual direction:
- transparent background;
- no oversized pill container;
- muted inactive text;
- active text becomes primary;
- thin brass active indicator.

Use this style for:

```text
Morphology
Graph / Objects / Relations

Query result
JSON / Table / Graph

Inspector
Overview / Relations / Evidence / History
```

Do not use a segmented-control visual treatment everywhere.

---

# 56. Badges and status chips

Base: shadcn `Badge`.

Badges should communicate compact metadata or state.

Examples:

```text
Ready
Processing
Compiled
Conflict
PDF
CSV
Contract
v17
```

Rules:
- badges remain small;
- no giant pills;
- semantic status combines label + color;
- type badges and status badges must not look identical if both are present together.

---

# 57. Tables

Base:
- shadcn `Table`;
- TanStack Table for behavior;
- TanStack Virtual when data volume justifies virtualization.

Visual rules:
- no card around every row;
- subtle separators;
- sticky header when scrolling;
- compact vertical rhythm;
- row hover remains subtle;
- selected row gets an unmistakable but restrained state;
- numeric columns align consistently;
- technical identifiers may use Geist Mono.

Tables are a first-class Elmorf interaction surface, not fallback UI.

---

# 58. Menus, popovers and contextual actions

Use shadcn:
- `DropdownMenu`;
- `ContextMenu`;
- `Popover`;
- `Command`;
- `Tooltip`.

Guidelines:

**Dropdown Menu**
- button-triggered action lists.

**Context Menu**
- graph/object/table contextual operations where right-click is genuinely useful;
- never make right-click the only path to an important action.

**Popover**
- compact contextual controls;
- filters;
- status details;
- lightweight inspectors.

**Command**
- command palette;
- global search/navigation;
- object jumping where useful.

---

# 59. Dialog, Sheet and Inspector ownership

Use:
- `Dialog` for blocking decisions/forms;
- `AlertDialog` for destructive confirmation;
- `Sheet` primarily for mobile/off-canvas contextual surfaces;
- persistent desktop Inspector as a dedicated resizable workspace panel.

Do not implement the desktop inspector as a modal Sheet if it needs to coexist continuously with the graph/table.

The desktop inspector should feel structurally attached to the workspace.

---

# 60. Resizable surfaces

Use resizable panels where the user benefits from allocating working space.

Primary case:

```text
Morphology workspace | Inspector
```

Possible later case:

```text
Query editor | Result
```

Rules:
- reasonable minimums;
- no panel may be resized to a useless 20px sliver;
- persist user size locally when valuable;
- double-click reset may be considered;
- resizing should not trigger expensive graph recomputation continuously if avoidable.

---

# 61. Component matrix v0.2

| Elmorf need | Base implementation | Elmorf treatment |
|---|---|---|
| Primary action | shadcn Button | Brass, restrained radius |
| Secondary action | shadcn Button | Elevated graphite |
| Icon toolbar action | shadcn Button / ghost | 28–32px, tooltip |
| Text input | shadcn Input | Dense, brass focus |
| Long form input | shadcn Textarea | Same token language |
| Option selection | shadcn Select | Dense workspace styling |
| Search/command | shadcn Command | Global/object search |
| Tabs | shadcn Tabs | Low-noise underline |
| Status | shadcn Badge | Semantic variants |
| Tooltips | shadcn Tooltip | Required for ambiguous icon-only actions |
| Menus | shadcn DropdownMenu | Compact actions |
| Right-click graph actions | shadcn ContextMenu | Secondary access path |
| Small contextual form | shadcn Popover | Filters/settings |
| Modal form | shadcn Dialog | Restrained width |
| Destructive confirmation | shadcn AlertDialog | Explicit consequences |
| Mobile contextual panel | shadcn Sheet | Off-canvas |
| Notifications | Sonner | Sparse, meaningful |
| Loading placeholder | shadcn Skeleton | Match final geometry |
| Progress | shadcn Progress + product wrapper | Processing/compile |
| Sidebar | shadcn Sidebar | Persistent 232px desktop |
| Basic table markup | shadcn Table | Elmorf density |
| Data-table behavior | TanStack Table | Sorting/filtering/visibility |
| Large-list virtualization | TanStack Virtual | Only where useful |
| Split layout | Resizable | Inspector/workbench |
| Graph canvas | Sigma.js | Custom Elmorf visual layer |
| Graph model | Graphology | Product data adapter |
| Editable flows | React Flow | Only when user edits a flow |

---

# 62. Product-component naming conventions

Generic primitives:

```text
components/ui/button.tsx
components/ui/input.tsx
components/ui/tabs.tsx
```

Elmorf product components should not be hidden in `components/ui`.

Preferred conceptual grouping:

```text
components/
├── ui/
│   └── shadcn-derived primitives
├── shell/
│   ├── app-sidebar
│   ├── app-topbar
│   ├── project-switcher
│   └── global-system-status
├── data/
├── compile/
├── morphology/
├── query/
└── shared/
```

The exact repository structure belongs to the later frontend technical specification, but the ownership boundary is fixed here.

---

# 63. Icon rules v0.2

Lucide is the baseline icon library.

Use stroke icons.

Default:
```text
16px
```

Common:
```text
14 / 16 / 18 / 20
```

24px should be uncommon inside the working application.

Rules:
- do not color every navigation icon brass;
- active navigation may use brass strategically;
- semantic state icons may use semantic colors;
- icons should not replace understandable text merely to save a few pixels.

---

# 64. Amber budget

Elmorf's brass/amber identity depends on restraint.

On working screens, amber primarily marks:

```text
current
selected
primary
focused
important
```

Amber should not become:
- a generic decoration color;
- a border on every card;
- the default icon color;
- the color of every chart;
- the background of large surfaces.

A useful review question:

> If all brass accents are temporarily converted to white, is the information hierarchy still understandable?

If the answer is no, structure is relying too heavily on color.

---

# 65. Surface composition rules

Preferred:

```text
background
  └── workspace content
      ├── border-separated region
      └── occasional card/elevated surface
```

Avoid:

```text
background
  └── card
      └── card
          └── card
              └── card
```

Elmorf is not a “dashboard card collection”.

Use cards when they express a real grouping.

Use whitespace, alignment and dividers for most hierarchy.

---

# 66. Application page header contract

A standard workspace page may have:

```text
Title
Short context/status
Primary action
Optional secondary actions
```

Example:

```text
Data                                      [ Add data ]
248 sources · 2 processing
```

Do not add a 140px hero header to internal application pages.

Morphology and Query may use toolbars instead of conventional page headers because their primary purpose is continuous work.

---

# 67. Workspace toolbar contract

Toolbars are appropriate for high-interaction surfaces.

A toolbar may contain:
- search;
- view selector;
- filters;
- fit/reset;
- layout control;
- contextual actions.

Rules:
- actions should be grouped by purpose;
- destructive actions are separated;
- icon-only actions require tooltip;
- avoid more than one visual “primary” button in the toolbar.

---

# 68. Morphology layout contract v0.2

Initial desktop morphology structure:

```text
┌────────────────────────────────────────────────────────────┐
│ Morphology toolbar                                         │
├─────────────────────────────────────────┬──────────────────┤
│                                         │                  │
│                                         │                  │
│ Graph / Objects / Relations workspace   │ Inspector        │
│                                         │                  │
│                                         │                  │
└─────────────────────────────────────────┴──────────────────┘
```

The view switch (`Graph / Objects / Relations`) belongs inside Morphology, not the global sidebar.

A selected object should survive switching from Graph to Objects where practical.

The URL should be capable of representing at minimum:
- project;
- Morphology projection;
- selected object/relation where shareability is useful.

---

# 69. Graph rendering contract

Sigma.js is the default rendering engine for Morphology Graph.

Graphology is the graph data/algorithm layer.

The UI must isolate graph-domain data from renderer-specific structures through an adapter boundary.

Conceptually:

```text
Elmorf API graph DTO
       ↓
Morphology graph adapter
       ↓
Graphology
       ↓
Sigma renderer
```

Do not let Sigma-specific node structures leak throughout application state.

This preserves the ability to:
- change renderer version;
- server-render non-canvas views;
- test graph-domain transformations without a browser canvas;
- reuse graph data in table/query representations.

---

# 70. Design-system validation gates

Before a page is considered visually accepted, verify:

### Identity
- Does it still look like Elmorf without the logo?
- Is brass restrained?
- Are gradients absent?

### Structure
- Is the hierarchy readable without card spam?
- Is the primary action obvious?
- Is the current context obvious?

### Density
- Is working information dense enough?
- Is whitespace functional rather than decorative?

### shadcn discipline
- Was an existing shadcn primitive reused where applicable?
- Are semantic tokens used instead of raw colors?
- Was a custom component created because of product semantics rather than preference?

### Interaction
- Hover, focus, selected and disabled are distinct.
- Keyboard focus exists.
- Loading/error/empty states are covered.

### Product language
- Technical concepts use one consistent name.
- The UI does not invent enterprise terminology around simple actions.

---

# 71. Visual validation milestone

After the full design pass, the first visual validation composition is still:

> **App Shell + Morphology**

This is not a new document. It is the first screen used to test the rules in this same design system. It must validate:
- shadcn/Radix Sidebar;
- Project Switcher;
- Topbar;
- Global System Status;
- Morphology toolbar;
- Graph canvas;
- selected node;
- Inspector;
- view tabs;
- filters;
- tooltips;
- badges;
- resizable layout;
- Elmorf density and surface hierarchy.

The resulting implementation/mocks may cause refinements to this document, but do not create a separate design-system specification.

---

# 72. Full-pass product specification

The sections below complete the first full design pass. They convert the previous foundations into a concrete product language covering every major surface, state and interaction required for the first frontend implementation.

# 73. Logo micro-geometry

The Elmorf mark is the broken square discussed earlier.

Canonical construction target:

```text
viewBox: 0 0 32 32
outer bounds: x=4..28, y=4..28
stroke: 2.5
stroke alignment: centered
line cap: square
line join: miter
left-side gap: 8 units
vertical gap position: centered
```

Conceptual SVG:

```svg
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M4 11V4H28V28H4V21"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="square"
    stroke-linejoin="miter"
  />
</svg>
```

This exact micro-geometry must be visually tested at:

```text
16px
20px
24px
32px
64px
```

Allowed final tuning before freeze:
- stroke 2.25–2.75;
- gap 7–9 units.

Not allowed:
- adding a square/dot into the gap;
- arrowheads;
- gradients;
- internal symbols;
- bracket interpretation;
- rounded corners that change the geometric character.

Primary dark-mode mark: `#C89B45`.
Monochrome mark: `#E8E6E3`.

Favicon: brass mark on graphite background.

# 74. Public brand usage

The wombat is a mascot, not the logo.

It may appear in:
- merchandise;
- documentation illustration;
- playful developer easter eggs;
- selected empty states;
- workstation identity.

It must not replace the mark in:
- navbar;
- favicon;
- login;
- app shell;
- API identity;
- product iconography.

# 75. Exact application terminology

The UI vocabulary for v1 is frozen as:

```text
Project
Overview
Data
Source
Processing
Compile
Compilation
Compiled Model
Model version
Morphology
Object
Relation
Evidence
Conflict
Query
Settings
```

Important distinctions:

```text
Source != Document
```

A source may be CSV, API data, archive, image, database export or another input.

```text
Processing != Compilation
```

Processing prepares source data. Compilation builds the model.

```text
Conflict != Error
```

A conflict is a property of knowledge/model state. An error means an operation failed.

```text
Object != Entity
```

For v1 user-facing terminology, use **Object** consistently unless the API is later deliberately branded around Entity.

# 76. Application sidebar — final v1 baseline

```text
[ Elmorf ]

[ Project selector ▾ ]

Overview

Data
Compile
Morphology
Query

────────────

Settings
```

No `Runs`.

If a future requirement creates a cross-system journal of background work, the candidate name is `Activity`, but only when that product need is real.

Desktop sidebar rules:
- persistent;
- 232px target width;
- no icon-only collapse in v1;
- active item uses soft brass background, stronger foreground and restrained brass icon;
- hover uses neutral elevated surface;
- labels remain visible.

# 77. Sidebar icon candidates

Use Lucide.

Candidate mapping:

```text
Overview      Gauge
Data          Database
Compile       Boxes / Cpu / Hammer — choose visually after shell mock
Morphology    Network
Query         SquareTerminal
Settings      Settings2
```

The final Compile icon is intentionally left to visual comparison because semantics matter more than forcing a theoretically perfect icon now.

# 78. Application topbar — final v1 baseline

Height: `52px`.

Desktop structure:

```text
[ context / page identity ]                     [ Search ] [ Status ] [ Docs ] [ User ]
```

Rules:
- no decorative center content;
- no duplicate project selector;
- no breadcrumb unless it improves orientation;
- no page-level hero in app shell;
- Command/Search trigger should advertise `⌘K` on wide screens;
- on narrower screens it may become icon-only with Tooltip.

Meaningful breadcrumb examples:

```text
Data / contracts-2026.zip
Morphology / Acme Corp
Compile / v18
```

Bad breadcrumb:

```text
Home / Projects / Project / Morphology
```

# 79. Project switcher

Location: `SidebarHeader`.

Default state:

```text
Vendor Contracts        ▾
```

Open state is implemented with shadcn/Radix primitives, likely Popover/Command or Dropdown + Command composition.

Contents:

```text
Search projects
Recent projects
All projects
────────────
Create project
```

On project change:
- project-scoped selection clears;
- old object/relation IDs must not remain selected;
- equivalent section may stay open;
- graph viewport resets unless a deliberately persisted per-project viewport exists.

# 80. Global System Status

The app must answer from any screen:

> What is Elmorf doing right now?

Compact states:

```text
● Ready
◐ Processing
◐ Compiling
! Attention
```

Popover example:

```text
Data processing     2 running
Compilation         v18 running
Current model       v17
```

Rules:
- background work never requires the user to stay on its source page;
- state text accompanies icons/colors;
- clicking a row navigates to the relevant detail where useful.

# 81. Command palette and global search

Shortcut:

```text
⌘K
Ctrl+K
```

Implementation base:
- shadcn `Command`;
- Radix Dialog behavior.

Search targets:
- navigation;
- projects;
- sources;
- objects;
- recent queries;
- selected safe commands.

Examples:

```text
Go to Data
Open project: Vendor Contracts
Open object: Acme Corp
Compile current project
```

Do not surface dangerous destructive actions in the default command palette.

# 82. Inspector system — final baseline

Desktop Inspector is a structural panel, not a modal Sheet.

Dimensions:

```text
default 392px
min     320px
max     520px
```

Use resizable panels.

Applicable contexts:
- Object;
- Relation;
- Source;
- Compilation detail;
- Evidence/result detail.

Behavior:
- opens on selection;
- selection changes content in place;
- close is explicit;
- panel has independent scroll;
- width can persist locally;
- graph/workspace remains usable while inspector is open.

Tablet/mobile: use shadcn/Radix Sheet.

# 83. Overview — final v1 information architecture

Purpose:

> The pulse of the current Project.

Not BI.

Suggested desktop composition:

```text
Overview
Vendor Contracts                                      Model v7

Sources      Objects      Relations      Conflicts
42           1,284        3,891          14

Project health
Data processing       Ready
Compilation           Ready
Current model         v7
API                   Operational

Model growth                          Processing
[ chart ]                             [ compact status ]

Recent activity
...
```

Rules:
- metrics should prefer a compact strip to six giant cards;
- no more than 2–3 meaningful charts;
- charts must answer a real operational question;
- project state is more important than decorative historical analytics.

Useful chart candidates:
1. object/relation growth by model version;
2. source states;
3. conflict trend.

# 84. Data — final v1 layout

Header:

```text
Data                                               [ Add data ]
42 sources · 1 processing · 1 failed
```

Toolbar:

```text
[ Search sources........................ ] [ Status ] [ Type ] [ Filters ]
```

Main table baseline:

```text
Name                     Type     Status       Size       Updated
supplier-master.csv      CSV      Ready        2.4 MB     ...
contracts-2026.zip       ZIP      Processing   81 MB      ...
legacy-vendors.xlsx      XLSX     Failed       14 MB      ...
```

Default columns:
- Name;
- Type;
- Status;
- Size;
- Updated.

Optional column:
- current processing stage.

Objects/Relations are not mandatory Data columns because they belong to the compiled model, not raw ingestion.

# 85. Data states

Must design:

```text
Empty
Queued
Uploading
Processing
Ready
Failed
Cancelled
```

If real progress is available:

```text
Extracting · 63%
```

If not available:

```text
Processing
```

Never invent progress percentages.

# 86. Add Data interaction

Primary action:

```text
+ Add data
```

Use shadcn Dialog or Sheet based on context, with Radix semantics.

Content:

```text
Drop files here
or Browse files

Supported formats ...
```

Optional metadata is secondary.

Do not create a multi-step upload wizard unless source configuration genuinely requires it.

Simple file dropping may use native file APIs. Use `@dnd-kit/react` only when a richer drag/drop interaction is actually required.

# 87. Source Inspector

Tabs/sections:

```text
Overview
Processing
Metadata
Errors
```

Overview:
- filename/source name;
- type;
- size;
- created/updated;
- status.

Processing:
- current stage;
- timing;
- retry/cancel when valid.

Errors:
- concise user-facing reason;
- expandable technical detail;
- retry action where safe.

# 88. Compile — final v1 layout

Header:

```text
Compile                                      [ Compile new version ]
Current model v17 · compiled 8 min ago
```

Current model summary:

```text
Sources       248
Objects       8,391
Relations     21,492
Conflicts     127
```

Active compilation:

```text
Compilation v18
Running · 01:42 elapsed

Bones       ✓   00:18
Flesh       ●   01:24
Compile     ·

[ Cancel ] [ View logs ]
```

The stage representation is compact and operational, not a decorative timeline.

# 89. Compile states

Required:

```text
Ready
Running
Completed
Failed
Cancelled
```

Completion example:

```text
Model v18 compiled

1,312 objects
3,944 relations
11 conflicts

[ Open morphology ] [ Run query ]
```

Do not fill the screen with a giant success color.

Failure example:

```text
Compilation failed during Flesh processing.
Current model v17 is still available.

[ View logs ] [ Retry compilation ]
```

This distinction is critical: a failed new compile does not imply the existing model vanished.

# 90. Compilation history

Dense table:

```text
Version
Status
Sources
Objects
Relations
Conflicts
Duration
Created
```

Actions:
- Open;
- Inspect details.

Version comparison is deferred from v1.

# 91. Compilation logs

Logs are secondary detail, not the whole page.

Requirements:
- Geist Mono;
- severity filter;
- search;
- virtualized if large;
- copy diagnostics;
- timestamps where useful.

Do not stream technical logs into a user-facing toast feed.

# 92. Morphology — central application workspace

Morphology is the main visual identity of the product.

Structure:

```text
Morphology                                             Model v17

[ Graph | Objects | Relations ]
[ Search morphology........................ ] [ Filters ] [ Layout ] [ Fit ]

┌─────────────────────────────────────────────┬──────────────────────┐
│                                             │                      │
│                 WORKSPACE                   │      INSPECTOR       │
│                                             │                      │
└─────────────────────────────────────────────┴──────────────────────┘
```

Graph / Objects / Relations are alternate projections of one model, not separate product domains.

# 93. Morphology URL contract

Candidate shareable state:

```text
project
view=graph|objects|relations
selected object/relation
model version when explicitly non-current
meaningful filters
```

Transient UI state stays out of the URL.

# 94. Shared Morphology selection

If the user selects `Acme Corp` in Graph and switches to Objects, the same object should remain selected when practical.

Likewise:

```text
Objects → Graph
Relations → Graph
```

The product should feel like one model with multiple projections.

# 95. Morphology Graph — default visual language

Default graph is intentionally low-color.

Node:
- elevated graphite fill;
- neutral border;
- selected node uses brass border/state;
- label uses off-white/muted hierarchy.

Edge:
- charcoal/neutral;
- selected relation becomes brass;
- connected neighbourhood becomes stronger;
- unrelated graph fades on selection.

No glow.
No rainbow by default.
No random shapes.

# 96. Node semantics

Default mode does not encode every type with a strong color.

Object type is primarily exposed through:
- label/context;
- inspector;
- filters.

Optional analytical visualization mode:

```text
Color by type
```

Candidate muted categorical palette:

```text
Muted brass    #A9823E
Slate blue     #647483
Dust violet    #756B83
Muted teal     #607A76
Warm clay      #8A675D
Stone          #77736D
```

Rules:
- analytical mode only;
- stable mapping inside a project;
- type color never overrides selected/conflict state;
- do not generate infinite random colors.

# 97. Visual-state precedence for nodes

If states collide:

```text
Selected > Conflict marker > Type visualization
```

Selection must always be obvious.

Conflict is shown as a marker/ring, not by painting the whole object warning-orange.

# 98. Confidence visualization

Confidence is shown numerically in details.

It is not permanently encoded in the default graph.

Optional analytical modes may later offer:

```text
Size by confidence
Opacity by confidence
```

but these are not default behavior.

# 99. Edge language

Edges are visually secondary to nodes.

Direction:
- show arrowheads only where direction is semantically meaningful.

Labels:
- far zoom: none;
- medium: selected/hovered relations;
- near: selected neighbourhood and optional local labels.

Never render thousands of relation labels at once.

# 100. Graph level of detail

Far zoom:
- structure;
- cluster mass;
- selected state;
- minimal labels.

Medium zoom:
- salient labels;
- selected neighbourhood;
- community/cluster labels.

Near zoom:
- object labels;
- local relation labels;
- richer context.

LOD is a noise-control system, not an animation gimmick.

# 101. Clusters and communities

Allowed visual language:
- subtle boundary;
- extremely soft fill;
- label;
- object count.

Collapsed cluster example:

```text
Suppliers
128 objects
```

If community detection is algorithmic, the UI must not present it as absolute semantic truth.

# 102. Graph interaction set

Required:
- pan;
- zoom;
- fit;
- search;
- select;
- focus;
- filters;
- neighbourhood inspection;
- context menu;
- clear selection with Escape.

Potential v1 if implementation cost is reasonable:
- multi-select;
- pin node;
- expand neighbours;
- collapse cluster.

Moving visual node positions does not mutate the compiled model.

# 103. Graph renderer architecture

Canonical architecture:

```text
Elmorf graph DTO
       ↓
Morphology graph adapter
       ↓
Graphology
       ↓
Sigma renderer
```

No Sigma-specific structures in general application state.

Use a production-stable Sigma major at implementation time. Do not adopt an alpha/beta major solely for newer rendering features.

ForceAtlas2 should run in a worker for non-trivial graphs.

# 104. Graph performance UX

Large graph behavior must be explicit.

Possible states:

```text
Preparing graph…
Rendering 12,481 objects…
Showing clustered view for performance
```

If the UI samples or aggregates, say so.

Never silently present a partial graph as complete.

# 105. Morphology / Objects

Dense table projection.

Default columns:

```text
Identity
Type
Relations
Confidence
Updated
```

Optional:

```text
Conflicts
```

Behavior:
- TanStack Table;
- virtualization for large lists;
- sorting;
- filtering;
- column visibility;
- sticky header;
- selected row;
- same Object Inspector as Graph.

# 106. Morphology / Relations

Default columns:

```text
From
Relation
To
Confidence
Evidence
Updated
```

Selecting a relation opens Relation Inspector.

Filters:
- relation type;
- source/target object type;
- confidence;
- conflict state if applicable.

# 107. Object Inspector — final v1 baseline

Header:

```text
Company
Acme Corp
obj_01J...
Confidence 0.96
```

Tabs:

```text
Overview
Attributes
Relations
Evidence
```

`History` is added only when backend model history exists at useful fidelity.

Overview:
- identity;
- main type;
- primary attributes;
- model version;
- conflict summary.

Attributes:
- dense key/value layout;
- visible data types when useful;
- `unknown`, `null` and `missing` must not collapse into the same presentation.

Relations:
- grouped by type or incoming/outgoing depending data shape.

Evidence:
- source;
- locator;
- snippet;
- open-source action.

# 108. Relation Inspector — final v1 baseline

Header example:

```text
SIGNED

Acme Corp
→
Contract #14
```

Sections:

```text
Overview
Evidence
Metadata
```

Expose:
- direction;
- confidence;
- provenance;
- evidence;
- model version.

# 109. Evidence design language

Evidence is first-class because it explains why the model exists.

Evidence item:

```text
Source name
Locator
Short contextual snippet
Open source
```

Locator may be:
- page;
- paragraph;
- sheet;
- row;
- timestamp;
- node;
- other source-specific coordinate.

Avoid surfacing raw storage paths and internal retrieval IDs as primary UI text.

# 110. Query — final v1 product definition

Query is a developer/data workbench.

It is not a chat interface.

Explicitly prohibited:
- assistant bubbles;
- avatar;
- typing indicator;
- conversational transcript as primary structure.

Layout:

```text
Query                                               Model v17
Natural | Structured

┌─────────────────────────────────────────────────────────────┐
│ query editor                                                │
│                                                  [ Run ]    │
└─────────────────────────────────────────────────────────────┘

Result
JSON | Table | Graph

3 objects · 12 relations · 18 ms

Evidence

Generated code
Python | HTTP
```

# 111. Query modes

v1 modes:

```text
Natural
Structured
```

Natural:
- human-language request against CM.

Structured:
- real Elmorf query DSL/object query once backend contract exists.

The design system does not invent fake structured syntax.

# 112. Query result modes

Possible views:

```text
JSON
Table
Graph
```

Only show a tab when it is meaningful for the result shape.

Execution metadata:

```text
Model version
Execution time
Matched objects
Returned relations
```

# 113. Generated code

Successful UI queries should teach programmatic usage.

Tabs:

```text
Python
HTTP
```

Example concept:

```python
result = elmorf.get(...)
```

Exact SDK/API syntax is defined in the frontend/API specification after backend contract is frozen.

# 114. Query errors and no-result state

Distinct states:

```text
No result
Validation error
Execution error
Model unavailable
Permission error
```

`No result` is not styled as a failure.

Error UI says:
- what failed;
- where;
- what user can do;
- technical details expandable.

# 115. Query history

History belongs inside Query.

Capabilities:
- recent queries;
- reopen;
- duplicate;
- run again.

Do not add `History` to global sidebar.

# 116. Settings — final v1 structure

Settings is one global sidebar item with local navigation.

Project:

```text
General
API Keys
Compilation
Integrations
Danger Zone
```

Account:

```text
Profile
Appearance
Security
```

## 116.1 Appearance

Appearance is part of v1 foundation, not a deferred settings page.

Controls:

```text
Theme
○ Light
○ Dark
○ System

Language
English
Русский
```

Requirements:
- Theme uses the shared shadcn/Radix control and `next-themes` implementation defined by the frontend specification.
- Default theme is `System`.
- Language is a user preference; changing it must not require changing application route structure.
- Both settings persist across reload.
- When backend user preferences become available, the same UI synchronizes them without changing the component contract.

Deferred:

```text
Organization
Members
Roles
Billing
Invoices
SSO
```

Do not create fake enterprise settings to make the app look bigger.

# 117. API Keys UX

List:

```text
Name
Prefix
Created
Last used
```

Create:
- Dialog;
- reveal secret once;
- copy;
- explicit acknowledgement.

Revoke:
- destructive confirmation.

Never display full secret keys again after creation.

# 118. Empty-state system

Every empty state answers:

1. What is empty?
2. Why does it matter?
3. What should the user do next?

Bad:

```text
No data
```

Good:

```text
No sources yet.

Add files to create your first compiled model.

[ Add data ]
```

The mascot may be tested in selected empty states, but the information must work without it.

# 119. Loading-state system

Predictable shape:
- Skeleton.

Measurable operation:
- Progress.

Background operation:
- persistent system status + local state.

Do not blank an entire working screen on background refetch.

# 120. Error-state system

Every operational error answers:

```text
What failed?
What is affected?
What still works?
What can I do?
```

Example:

```text
Compilation failed during Flesh processing.
Current model v17 is still available.

[ View logs ] [ Retry compilation ]
```

Technical details are expandable, not primary.

# 121. Partial and stale model states

The user must understand when the current compiled model does not include all new data.

Example:

```text
Current model v17
3 newer sources are not included yet
```

This state is normal and should not look like a catastrophic error.

# 122. Conflict UX

Conflict is a model property, not a system failure.

Therefore:
- warning semantics;
- model remains usable;
- conflict is filterable;
- affected attributes/relations are inspectable;
- evidence stays close.

# 123. Table system — complete baseline

Technology:

```text
shadcn Table
TanStack Table
TanStack Virtual
```

Default visual behavior:
- no zebra stripes;
- subtle divider;
- hover;
- selected row;
- sticky header;
- 32px compact or 36px default row.

Sorting:
- header action;
- direction visible.

Filtering:
- explicit active filters;
- no hidden mystery filter state.

Column visibility:
- DropdownMenu.

Bulk selection:
- only when real bulk actions exist.

# 124. Filter language

Compact default:

```text
[ Filters · 3 ]
```

Active filters can surface as removable chips:

```text
Type: Company ×
Conflict ×
Confidence > 0.8 ×
```

Do not reserve a permanent 300px filter sidebar unless a specific screen proves it is necessary.

# 125. Search taxonomy

Global:
- `⌘K` across product.

Local Data:

```text
Search sources
```

Local Morphology:

```text
Search objects and relations
```

Query editor is not labelled Search.

# 126. Drag and drop

Primary library for advanced DnD:

```text
@dnd-kit/react
```

Use for:
- sortable/reorder;
- complex drop targets;
- drag overlays.

Do not use DnD where buttons are clearer.

If reorder is important, keyboard-accessible alternative is required.

# 127. Motion system — full baseline

Durations:

```text
Fast       120ms
Standard   180ms
Panel      240ms
Large      300ms maximum
```

Character:
- restrained ease-out;
- no bouncy spring by default.

Use motion to explain:
- opening/closing;
- focus change;
- selection;
- insert/remove;
- graph focus;
- reordering.

Do not animate:
- background;
- idle graph nodes;
- decorative floating objects;
- every card on initial render.

Respect `prefers-reduced-motion`.

# 128. Charts

Base:

```text
shadcn Chart
Recharts
```

Rules:
- no gradients;
- no 3D;
- no rainbow defaults;
- labels/tooltips readable;
- chart exists only if it communicates a pattern better than a number/table.

Color precedence:
- primary series = brass;
- secondary = neutral;
- warning = warning token;
- failure = error token.

# 129. Landing — final structure

The landing page is compact but highly informative.

Sections:

```text
1. Hero
2. What Elmorf is
3. Load → Compile → Get
4. Live SDK/product demonstration
5. Concrete use cases
6. Try Elmorf CTA
7. Footer
```

Do not add sections to make the page look larger.

# 130. Landing header

Preferred:

```text
[ mark Elmorf ]                         Docs  GitHub  Sign in  [ Try Elmorf ]
```

No mega menu.
No `Solutions / Industries / Platform / AI / Agents` hierarchy in v1.

# 131. Landing hero

Candidate headline:

```text
Compile messy data
into a consistent model.
```

Candidate support:

```text
Elmorf turns fragmented, inconsistent data into a structured,
queryable model your software can actually use.
```

CTA:

```text
[ Try Elmorf ] [ Read docs ]
```

Hero visual uses actual product visual language, not a separate marketing illustration system.

# 132. Landing SDK demo

Central concept:

```text
code → processing → compiled structure
```

Example placeholder:

```bash
pip install elmorf
```

```python
from elmorf import Elmorf

elmorf = Elmorf()

elmorf.load(...)
elmorf.compile(...)
result = elmorf.get(...)
```

Exact SDK method names remain subject to SDK contract.

Animation sequence:

```text
load()    → sources appear
compile() → model/graph forms
get()     → requested object highlights
```

No fake terminal typing show.

# 133. Landing code surface

Visual rules:
- elevated graphite surface;
- subtle border;
- Geist Mono;
- brass-soft active line;
- copy action;
- no macOS red/yellow/green fake window dots unless there is a functional reason.

# 134. Landing use cases

Use concrete tasks, not industry marketing walls.

Candidate list:

```text
Contracts
Product data
CRM cleanup
Entity resolution
Knowledge normalization
Cross-source reconciliation
```

Each receives one concise sentence.

# 135. Try Elmorf — final flow

Route:

```text
elmorf.com/try
```

No account required.

Prepared demo:

```text
Vendor Contracts
```

Flow:

```text
prepared sources
    ↓
compile/replay
    ↓
morphology
    ↓
open object/evidence
    ↓
run query
```

Persistent but quiet CTA:

```text
Compile your own data
[ Create account ]
```

No registration modal after first meaningful click.

# 136. Authentication — final baseline

Routes:

```text
app.elmorf.com/login
app.elmorf.com/signup
app.elmorf.com/forgot-password
```

Visual layout:

```text
            [ Elmorf ]

            Welcome back

            Email
            Password

            [ Sign in ]

            Continue with GitHub
            Continue with Google

            Create account
```

Form width: `360–400px`.

Background: graphite.

No:
- illustration split;
- gradient;
- testimonials;
- carousel.

# 137. First-run onboarding

After signup:

```text
Create your first project
```

Only necessary field:
- Project name.

Then:

```text
Add data
```

No eight-step onboarding wizard.
No sales questionnaire.
No industry/team-size fields unless required by actual product logic.

# 138. Responsive system

Elmorf is desktop-first.

## >= 1440px

Full experience:
- sidebar 232;
- inspector 392;
- full toolbar labels.

## 1280–1439px

- sidebar remains;
- inspector may reduce toward 360;
- toolbar can compact secondary labels.

## 1024–1279px

- workspace gets priority;
- Inspector may become overlay/Sheet;
- search trigger becomes compact;
- graph remains usable.

## 768–1023px

- Sidebar off-canvas;
- Inspector Sheet;
- tables adapt/horizontal scroll;
- graph available but secondary.

## < 768px

Public site fully supported.

Application supports:
- Overview;
- basic Data;
- basic Query;
- Settings.

Morphology defaults to Objects/list-oriented representation rather than pretending a phone is a full graph workstation.

# 139. Accessibility baseline

Required:
- visible focus;
- keyboard navigation;
- labels;
- semantic controls;
- reduced motion;
- acceptable contrast;
- screen-reader labels where needed;
- status not encoded only by color;
- table semantics;
- non-graph access to all model content.

Radix supplies primitive behavior but does not remove responsibility for application-level accessibility.

# 140. Keyboard baseline

Global:

```text
⌘K / Ctrl+K     Command palette
Esc             Close transient layer / clear selection when appropriate
Enter           Submit/run when focus semantics allow
```

Do not ship dozens of hidden custom shortcuts in v1.

# 141. Context menus

Graph node context menu may offer:
- Open details;
- Focus;
- Show neighbours;
- Copy object ID;
- Query this object, if meaningful.

Table row menu may offer:
- Open;
- Copy ID;
- context-specific safe actions.

Right click is a shortcut, never the only route to a critical action.

# 142. Tooltip rules

Use Tooltip for:
- icon-only control;
- unfamiliar graph control;
- terse technical hint.

Do not use Tooltip for long documentation.
Use Popover or docs link instead.

# 143. Notification policy

Use Sonner/toast only for meaningful transitions:

```text
Compilation v18 completed
3 sources failed to process
API key created
```

Do not toast:
- every autosave;
- every processing stage;
- navigation;
- routine selection.

# 144. Z-index contract

Conceptual levels:

```text
base             0
sticky           10
floating toolbar 20
popover          40
dialog           50
toast            60
```

No arbitrary `z-[999999]`.
Radix portals must fit the same layering system.

# 145. Scroll contract

Inside application shell:
- browser body should not become the accidental main scrolling container;
- workspace owns relevant page scroll;
- inspector has independent scroll;
- sidebar may scroll independently;
- graph canvas does not produce browser page scroll.

Dialog scroll-lock relies on Radix behavior where applicable.

# 146. Mock-first design language

The first frontend is a real frontend against a fake backend.

Required architecture concept:

```text
UI
 ↓
query/mutation hooks
 ↓
typed API client
 ↓
HTTP
 ↓
MSW
 ↓
fixtures / generated data
```

UI components must not import raw mock arrays directly.

# 147. Canonical demo dataset

Working demo project:

```text
Project: Vendor Contracts
Sources: 42
Current model: v7
Objects: 1,284
Relations: 3,891
Conflicts: 14
```

These values are clearly synthetic/demo data.

# 148. Required mock source states

Fixtures must include:

```text
Ready
Queued
Uploading
Processing
Failed
Cancelled
```

# 149. Required mock compilation states

Fixtures must include:

```text
Idle/current
Running
Completed
Failed
Cancelled
```

# 150. Required graph fixtures

At least:

```text
small     ~30 nodes
medium    ~500 nodes
large     thousands of nodes for performance behavior
```

Graph fixtures must contain:
- disconnected clusters;
- dense cluster;
- sparse region;
- high-degree hub;
- conflicts;
- multiple relation types.

# 151. Required query fixtures

At least:
- single object result;
- multi-object result;
- graph-like result;
- empty result;
- validation error;
- execution error;
- slow response.

# 152. Storybook requirements

Storybook is mandatory.

Primitive stories for major UI components:

```text
Default
Hover
Focus
Disabled
Error where applicable
Loading where applicable
Dense
```

Product component stories:

```text
ProjectSwitcher
GlobalSystemStatus
SourceStatus
CompilationPipeline
ModelVersionBadge
ObjectInspector
RelationInspector
EvidenceList
QueryResultViewer
```

Page/composition stories:

```text
AppShell
Data populated
Data empty
Compile running
Morphology with selected object
Query result
```

## 152.1 Theme and locale matrix

Storybook uses the same production theme/i18n infrastructure.

Critical components/compositions must be reviewable in:

```text
Dark / English
Light / English
Dark / Russian
Light / Russian
```

Storybook toolbar must expose:

```text
Theme: Light / Dark / System
Locale: EN / RU
```

For deterministic visual snapshots, `System` may be resolved explicitly to Light or Dark by the test harness.

# 153. Design copy tone

Copy is:
- direct;
- concise;
- technically accurate;
- calm.

Bad:

```text
Unleash the power of AI to supercharge your data!
```

Good:

```text
Compile inconsistent source data into a queryable model.
```

Bad error:

```text
Oops! Something went wrong.
```

Good error:

```text
Compilation failed during Flesh processing.
Current model v17 is still available.
```

# 154. Performance perception rules

A fast product must not feel slow because of UI behavior.

Rules:
- preserve previous data during safe refetches;
- skeleton over blocking spinner;
- background work is visible but non-blocking;
- optimistic updates only where correctness allows;
- graph rendering does not freeze shell controls;
- expensive layouts run off the main thread where possible.

# 155. Design-system acceptance gates

Before approving any screen, check:

## Identity
- Does it still look like Elmorf without logo?
- No gradients?
- Brass restrained?
- Graphite hierarchy intact?

## shadcn/Radix discipline
- Existing shadcn component reused where appropriate?
- Radix behavior reused rather than rebuilt?
- Base UI absent?
- Semantic tokens instead of raw colors?

## Structure
- Primary action obvious?
- Current context obvious?
- Card spam absent?

## Density
- Working UI compact enough?
- Controls not oversized?

## States
- Loading covered?
- Empty covered?
- Error covered?
- Disabled covered?
- Background processing covered?
- Partial/stale state covered?

## Accessibility
- Focus visible?
- Keyboard works?
- Labels exist?
- Status is not color-only?

## Language
- Terminology follows the frozen vocabulary?

# 156. Design QA anti-pattern checklist

Reject in review:

```text
raw HEX inside product components
random radius
random shadow
gradient
Base UI primitive
custom modal instead of Radix Dialog
custom keyboard menu instead of Radix menu primitives
custom tooltip behavior
card for every metric
amber on every icon
full-screen blocking loader for background work
rainbow graph by default
placeholder-only important form
fake progress percentage
Query implemented as chat
new top-level sidebar item without product justification
```

# 157. Final screen inventory

## Public

Landing:
- desktop;
- tablet/mobile;
- SDK demo idle;
- SDK demo load;
- SDK demo compile;
- SDK demo get.

Try:
- initial;
- compiling/replay;
- graph;
- selected object;
- evidence;
- query;
- no result;
- demo error.

## Authentication

Login:
- default;
- validation;
- submitting;
- authentication error.

Signup:
- default;
- validation;
- submitting;
- success transition.

Forgot password:
- request;
- sent.

## App shell

- normal desktop;
- narrow desktop;
- mobile/off-canvas sidebar;
- command palette;
- status ready;
- status processing;
- status compiling;
- status attention;
- user menu;
- project switcher.

## Overview

- populated;
- first-run empty;
- newer sources not compiled;
- background processing.

## Data

- empty;
- populated;
- filtered;
- upload dialog;
- uploading;
- processing;
- failed source;
- source inspector;
- delete confirmation.

## Compile

- ready;
- running;
- completed;
- failed;
- cancelled;
- logs;
- history;
- compilation detail.

## Morphology

- graph loading;
- graph populated;
- selected object;
- selected relation;
- conflict;
- filters active;
- no result;
- clustered/large graph;
- objects table;
- relations table;
- object inspector;
- relation inspector;
- evidence.

## Query

- empty editor;
- Natural;
- Structured;
- running;
- JSON result;
- Table result;
- Graph result;
- no result;
- validation error;
- execution error;
- generated Python;
- generated HTTP;
- history.

## Settings

- General;
- API Keys;
- create key;
- key reveal;
- revoke;
- Compilation;
- Integrations empty/placeholder;
- Profile;
- Security;
- Danger Zone.

# 158. Final candidate design tokens

Layout:

```text
--app-sidebar-width: 232px
--app-topbar-height: 52px
--inspector-width: 392px
--inspector-min-width: 320px
--inspector-max-width: 520px
--page-padding-x: 24px
--page-padding-y: 24px
```

Controls:

```text
--control-sm: 28px
--control-md: 32px
--control-lg: 40px
--table-row-compact: 32px
--table-row-default: 36px
```

Motion:

```text
--motion-fast: 120ms
--motion-standard: 180ms
--motion-panel: 240ms
--motion-large: 300ms
```

Radius:

```text
--radius-xs: 4px
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 10px
--radius-xl: 12px
```

# 159. Design-level technology ownership

Baseline stack known to the design system:

```text
Next.js
TypeScript
Tailwind CSS

shadcn/ui
Radix UI
Lucide

React Hook Form
Zod

TanStack Query
TanStack Table
TanStack Virtual

Zustand

Sigma.js
Graphology
graphology-layout-forceatlas2

@xyflow/react
# only for editable workflow/flow surfaces; not Morphology

@dnd-kit/react

Recharts
Motion
Sonner

MSW
Faker

Storybook
Vitest
Testing Library
Playwright
```

Exact versions, package configuration and install commands belong in `ELMORF_FRONTEND_SPEC.md`.

# 160. State ownership contract

```text
Server/API/cache state       → TanStack Query
Workspace/local UI state     → Zustand
Shareable navigation state   → URL/search params
Forms                        → React Hook Form + Zod
Graph renderer state         → graph adapter/renderer layer
```

Do not use Zustand as a universal database.

# 161. Surface hierarchy — final rule

The product has three main surface levels:

```text
Level 0   #111315
Level 1   #171A1D
Level 2   #1D2125
```

Additional hierarchy comes from:
- alignment;
- border;
- spacing;
- typography;
- state.

Not from endless nested cards.

# 162. Product-specific visual signature

Elmorf must remain recognizable through the combination of:

1. broken-square mark;
2. graphite + restrained brass;
3. compact engineering density;
4. strict surface hierarchy;
5. Morphology graph language;
6. technical mono only where truth/IDs/code require it;
7. evidence-first inspection;
8. raw Data → Compile → Model → Query mental model;
9. quiet interaction design;
10. deliberate absence of visual AI clichés.

If the logo is removed, the product should still feel like Elmorf.

# 163. Intentionally deferred product areas

Do not design beyond minimal placeholders for:

```text
Billing
Organization admin
Members
Enterprise roles
SSO
Audit log
Comments/collaboration
Manual model editor
Manual graph authoring
Advanced model-version diff
Dashboard builder
Full mobile graph workbench
AI chat assistant
```

These are not deleted forever; they are intentionally outside the current product boundary.

# 164. Implementation order from design perspective

Recommended visual implementation order:

```text
1. Tokens + shadcn/Radix primitives
2. App Shell
3. Morphology
4. Data
5. Compile
6. Query
7. Overview
8. Settings
9. Landing
10. Try
11. Auth
```

Reason:
Morphology stresses the design system hardest. If Morphology works, most of the application language is already proven.

Landing comes later so it can show the real product visual system rather than an invented marketing aesthetic.

# 165. What Cursor must NOT decide

Cursor must not independently decide:
- palette;
- primitive library;
- whether to use Radix;
- navigation names;
- sidebar structure;
- page naming;
- radius scale;
- graph color semantics;
- whether Query is chat;
- whether gradients are allowed;
- whether to add extra top-level sections;
- whether to replace shadcn with custom generic primitives.
- whether Light theme is required; it is required;
- whether `System` is the default theme; it is.

If implementation reveals a genuine contradiction, Cursor should flag it rather than silently changing product/design decisions.

# 166. Open questions remaining after full pass

The full pass intentionally leaves only a small set of design questions:

1. Final logo stroke/gap micro-adjustment after 16–64px visual test.
2. Final Lucide icon for Compile after seeing it in the real sidebar.
3. Final muted categorical palette for optional `Color by type` after testing on a real graph.
4. Exact Structured Query syntax, because this depends on backend/SDK contract.
5. Concrete integrations list, because product requirements do not exist yet.

Everything else in this document is the working baseline.

# 167. Decisions considered accepted unless explicitly revised

```text
Light / Dark / System from Phase 1
Dark is canonical brand reference
default theme = System
No gradients
Broken-square logo
Wombat is mascot, not logo
Graphite + Brass
Geist Sans + Geist Mono
shadcn mandatory
Radix mandatory
Base UI not used
semantic CSS variables
new-york / radix baseline
Lucide
persistent desktop sidebar
no desktop icon-only collapse
Project is application scope
Overview / Data / Compile / Morphology / Query / Settings
no Runs
Morphology = Graph + Objects + Relations
neutral graph by default
Inspector is contextual/resizable
Query is a workbench, not chat
Try works without auth
MSW fake backend architecture
Desktop-first application
Sigma + Graphology for Morphology
React Flow only for editable flow use cases
Evidence is first-class
```

# 168. Design freeze criteria

Promote the document from `1.0 Candidate` to `1.0 Frozen` when:

1. logo micro-geometry has been visually verified;
2. App Shell mock is approved;
3. Morphology mock is approved;
4. optional graph type palette is tested;
5. typography is visually validated on a real application screen;
6. information architecture has no unresolved objections;
7. contradictions are removed;
8. Light and Dark are visually validated on App Shell + Morphology;
9. System theme behavior and no-flash hydration are validated;
10. open questions are either solved or explicitly deferred.

`Frozen` does not mean immutable forever.

It means:

> Frontend implementation can proceed without Cursor inventing product and visual decisions during coding.

# 169. Final design statement

Elmorf is not designed to look intelligent.

It is designed to make complex structure **legible**.

That identity must survive both Light and Dark themes.

The visual formula is:

```text
Graphite surfaces
+
Off-white information
+
Rare brass state/action
+
Geometric structure
+
Dense working areas
+
Evidence and precision
+
No visual bullshit
```

The product should feel like a precise instrument for compiling structure from incomplete, inconsistent information.
