# Elmorf Frontend Specification

**Версия:** 1.0 Candidate  
**Дата:** 2026-09-25  
**Статус:** реализационная спецификация для первого mock-first frontend  
**Связанный документ:** `ELMORF_DESIGN_SYSTEM.md`  
**Назначение:** дать Cursor достаточно полную техническую спецификацию, чтобы реализовать frontend Elmorf без самостоятельного изобретения архитектуры, навигации, UX-паттернов и базовых визуальных решений.

---

# 0. Правила чтения документа

`ELMORF_DESIGN_SYSTEM.md` отвечает на вопрос:

> **Как Elmorf должен выглядеть и вести себя?**

Этот документ отвечает:

> **Как это должно быть реализовано во frontend-коде?**

Если документы расходятся:

1. продуктовая и визуальная семантика берётся из `ELMORF_DESIGN_SYSTEM.md`;
2. техническая реализация берётся из `ELMORF_FRONTEND_SPEC.md`;
3. если реализация требует изменения дизайн-контракта — обновляются оба документа явно;
4. Cursor не должен молча выбирать третью трактовку.

---

# 1. Главные цели первого frontend

Первый frontend должен быть:

- визуально полноценным;
- архитектурно пригодным для production;
- работающим поверх mock API;
- легко переключаемым на реальный backend;
- типизированным;
- i18n-ready и реально локализованным;
- theme-ready и реально поддерживающим light/dark/system;
- доступным с клавиатуры;
- тестируемым;
- пригодным для Storybook;
- пригодным для постепенной замены mock endpoints реальными.

Это **не throwaway prototype**.

Мы создаём настоящий frontend, у которого временно fake backend.

---

# 2. Жёсткие технические ограничения

Обязательно:

```text
Next.js
React
TypeScript strict
Tailwind CSS

shadcn/ui
Radix UI
Lucide

Zod
React Hook Form

TanStack Query
TanStack Table
TanStack Virtual

Zustand

Sigma.js
Graphology

@dnd-kit/react
react-resizable-panels

Recharts
Motion
Sonner

next-themes
next-intl

MSW
Faker

Storybook
Vitest
Testing Library
Playwright
```

## 2.1 shadcn/Radix

**Radix обязателен.**

При инициализации shadcn выбирать Radix base:

```bash
pnpm dlx shadcn@latest init -b radix
```

Новые generic primitives не пишутся вручную, если поведение уже покрывается shadcn/Radix.

Не использовать Base UI как parallel primitive system.

## 2.2 Next.js version policy

Использовать:

> **текущую production-stable Active LTS ветку Next.js 16 с последним доступным security patch на момент установки.**

Не фиксировать в документации случайный patch, который устареет через неделю.

`package.json`/lockfile фиксируют фактически установленную версию.

На 2026-09-25 ветка Next.js 16 является Active LTS; перед началом реализации необходимо установить актуальный security-patched release.

## 2.3 React

Использовать версию React, официально поддерживаемую выбранной стабильной версией Next.js.

Не форсировать более новую несовместимую React release вручную.

---

# 3. Package manager и workspace

Использовать:

```text
pnpm
```

Frontend создаётся как monorepo.

Предпочтительно:

```text
pnpm workspaces
+
Turborepo
```

Turborepo используется для:
- build graph;
- shared scripts;
- caching;
- lint/test/typecheck orchestration.

Не создавать сложную custom build system.

---

# 4. Почему monorepo

Elmorf имеет две разные поверхности:

```text
elmorf.com
app.elmorf.com
```

У них:
- разный routing;
- разная SEO-модель;
- разный i18n routing;
- разные bundle priorities;
- разные auth requirements.

Но они должны разделять:
- design tokens;
- shadcn/Radix components;
- domain schemas;
- API types;
- i18n conventions;
- graph UI для `/try`;
- shared utilities.

Поэтому первая архитектура:

```text
apps/site
apps/app
packages/*
```

Это предпочтительнее host-dependent routing внутри одного огромного Next.js app.

---

# 5. Репозиторий

Кандидатная структура:

```text
elmorf.frontend/
├── apps/
│   ├── site/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── i18n/
│   │   ├── messages/
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── app/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── i18n/
│       ├── messages/
│       ├── public/
│       ├── tests/
│       └── package.json
│
├── packages/
│   ├── ui/
│   ├── domain/
│   ├── api-client/
│   ├── graph/
│   ├── mocks/
│   ├── i18n/
│   ├── config/
│   └── test-utils/
│
├── .github/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

---

# 6. Назначение packages

## 6.1 `packages/ui`

Содержит:

- design tokens;
- global theme CSS;
- shadcn components;
- Radix-based primitives;
- generic Elmorf UI primitives;
- typography primitives;
- theme provider;
- icons/mark;
- layout primitives;
- Storybook stories для общего UI.

Не содержит:
- Source business logic;
- compilation queries;
- domain-specific API calls.

## 6.2 `packages/domain`

Содержит:
- Zod schemas;
- TypeScript domain types;
- enums/codes;
- pure transformations;
- shared selectors.

Пример:

```text
Project
Source
Compilation
ModelVersion
CompiledObject
Relation
Evidence
Query
```

Не содержит React.

## 6.3 `packages/api-client`

Содержит:
- HTTP client;
- request/response envelope;
- auth header injection;
- error mapping;
- endpoint functions;
- query key factories where appropriate;
- future OpenAPI integration boundary.

Не содержит UI.

## 6.4 `packages/graph`

Содержит:
- Elmorf Graph DTO adapter;
- Graphology construction;
- layout helpers;
- Sigma renderer integration;
- graph domain selectors;
- graph test fixtures.

`site:/try` и `app:/morphology` используют один graph package.

## 6.5 `packages/mocks`

Содержит:
- MSW handlers;
- fake store;
- fixtures;
- deterministic Faker generators;
- scenario presets;
- long-running operation simulator.

## 6.6 `packages/i18n`

Содержит shared:
- locale definitions;
- locale labels;
- direction helper;
- message typing helpers;
- format conventions;
- shared generic messages where reuse действительно оправдан.

Feature messages могут жить ближе к конкретному app.

## 6.7 `packages/config`

Shared:
- eslint;
- TypeScript;
- Prettier if used;
- Vitest;
- Playwright base conventions;
- Tailwind/shared build config if required.

---

# 7. TypeScript rules

Включить:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true
}
```

Дополнительные strict flags допускаются.

Запрещать:
- `any` без documented boundary;
- non-null assertions как обычный стиль;
- silent casts `as SomeType` на API payload.

Использовать:
- discriminated unions;
- Zod parse boundaries;
- exhaustive switches.

Пример:

```ts
type ProcessingState =
  | {status: 'queued'}
  | {status: 'processing'; stage: ProcessingStage; progress?: number}
  | {status: 'ready'; completedAt: string}
  | {status: 'failed'; error: ApiError}
  | {status: 'cancelled'; cancelledAt: string};
```

Это предпочтительнее:

```ts
{
  status: string;
  progress?: number;
  error?: string;
}
```

---

# 8. ESLint и formatting

ESLint обязателен.

Дополнительно:
- `@tanstack/eslint-plugin-query`;
- React/Next recommended rules;
- import boundaries при необходимости;
- no hardcoded translation literals rule либо custom lint policy.

Formatting:
- Prettier допустим;
- если formatter не нужен — не добавлять ради ритуала.

CI должен падать на:
- lint errors;
- type errors.

---

# 9. Dependency policy

Не устанавливать библиотеку, если задачу уже адекватно решает:
- browser platform;
- Next.js;
- React;
- Radix;
- shadcn;
- TanStack;
- уже принятая dependency.

Перед добавлением dependency Cursor должен ответить в коде/PR:
- какая задача;
- почему существующая база не решает;
- bundle/runtime impact.

Не добавлять:
- lodash целиком;
- moment;
- вторую chart library;
- вторую graph library «на всякий случай»;
- вторую state library;
- вторую component primitive system.

---

# 10. Next.js architecture

Использовать:

```text
App Router
React Server Components by default
Client Components only where interaction requires
```

Правило:

> `"use client"` ставится на минимально необходимой границе.

Не превращать root layout/page tree в client-only приложение без причины.

---

# 11. Site routes

`apps/site`

Кандидатная структура:

```text
app/
└── [locale]/
    ├── layout.tsx
    ├── page.tsx
    └── try/
        └── page.tsx
```

Но для default locale URL должен оставаться чистым через `next-intl` locale prefix policy.

Целевые публичные URL:

```text
https://elmorf.com/
https://elmorf.com/try

https://elmorf.com/ru
https://elmorf.com/ru/try
```

English — default locale.

Не обязательно выводить `/en` для default locale.

---

# 12. App routes

`apps/app`

Application i18n не требует locale в URL.

Целевые routes:

```text
/login
/signup
/forgot-password

/projects
/projects/new

/projects/[projectId]/overview
/projects/[projectId]/data
/projects/[projectId]/compile
/projects/[projectId]/morphology
/projects/[projectId]/query

/projects/[projectId]/settings
/projects/[projectId]/settings/api-keys
/projects/[projectId]/settings/compilation
/projects/[projectId]/settings/integrations
/projects/[projectId]/settings/danger

/settings/profile
/settings/security
/settings/appearance
```

## 12.1 Root redirect

`app.elmorf.com/`

Если user:
- не auth → `/login`;
- auth и имеет recent project → project overview;
- auth и нет project → `/projects`.

Mock mode должен воспроизводить эти варианты.

---

# 13. Route groups

Использовать route groups для layout boundaries.

Кандидат:

```text
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── forgot-password/
│
├── (account)/
│   ├── projects/
│   └── settings/
│
└── (workspace)/
    └── projects/
        └── [projectId]/
            ├── layout.tsx
            ├── overview/
            ├── data/
            ├── compile/
            ├── morphology/
            ├── query/
            └── settings/
```

---

# 14. Theme architecture — обязательная часть foundation

Несмотря на то, что Elmorf визуально проектируется dark-first, **frontend с первого дня обязан поддерживать**:

```text
light
dark
system
```

Это не deferred refactor.

## 14.1 Library

Использовать:

```text
next-themes
```

shadcn официально поддерживает этот подход для Next.js.

## 14.2 Provider

В каждом app:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

`html`:

```tsx
<html suppressHydrationWarning>
```

## 14.3 Theme ownership

`packages/ui` экспортирует общий ThemeProvider wrapper.

Site и app используют один token contract.

---

# 15. Theme tokens

Никаких dark-only hardcoded цветов в компонентах.

Все цветовые значения проходят через semantic variables.

## 15.1 Dark theme

Основной branded theme:

```css
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

  --accent: rgba(200,155,69,0.12);
  --accent-foreground: #E8E6E3;

  --destructive: #B85C4A;

  --border: #2A2F34;
  --input: #2A2F34;
  --ring: #C89B45;
}
```

## 15.2 Light theme

Light theme — не простая инверсия.

Кандидатная warm-graphite companion palette:

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

  --accent: rgba(154,111,35,0.12);
  --accent-foreground: #191B1D;

  --destructive: #A94F40;

  --border: #D6D1C8;
  --input: #C9C3B9;
  --ring: #9A6F23;
}
```

Перед production выполнить WCAG contrast audit.

## 15.3 Product theme tokens

Все Elmorf-specific graph/chart/status tokens должны иметь light и dark значения.

Пример:

```css
:root {
  --elmorf-graph-node: #FFFFFF;
  --elmorf-graph-node-border: #BDB7AD;
  --elmorf-graph-edge: #CBC5BC;
  --elmorf-graph-dimmed: #D9D5CE;
}

.dark {
  --elmorf-graph-node: #1D2125;
  --elmorf-graph-node-border: #3A4148;
  --elmorf-graph-edge: #343A40;
  --elmorf-graph-dimmed: #24282D;
}
```

---

# 16. Theme UX

## 16.1 App

`Settings → Appearance`

Control:

```text
Theme
○ Light
○ Dark
○ System
```

Использовать Radix RadioGroup через shadcn.

## 16.2 Public site

Небольшой theme switch в footer/header utility допустим.

Не превращать toggle в central brand element.

## 16.3 Persistence

Anonymous:
- `next-themes` local preference.

Authenticated:
- frontend preference работает локально сразу;
- когда backend user preferences появятся, server preference становится cross-device source;
- local choice синхронизируется mutation.

Не блокировать первый frontend ожиданием backend preference API.

---

# 17. No theme flash

Обязательно проверить:
- first paint;
- SSR hydration;
- system theme;
- hard reload;
- route navigation.

Не допускается яркая белая вспышка перед dark Elmorf.

---

# 18. i18n — обязательный foundation

Использовать:

```text
next-intl
```

Причины:
- App Router;
- Server Components;
- Client Components;
- ICU messages;
- date/number formatting;
- typed messages;
- locale routing.

## 18.1 Initial locales

Архитектура generic, но frontend foundation должен реально работать минимум с:

```text
en
ru
```

English:
- canonical/source locale;
- default public locale.

Russian:
- вторая реальная локаль;
- проверяет layout expansion и отсутствие hardcoded copy.

Позже без архитектурного refactor добавляются другие locales.

---

# 19. i18n routing strategy

## 19.1 Public site

Locale участвует в route.

Strategy:

```text
localePrefix: as-needed
defaultLocale: en
```

Пример:

```text
/             English
/try          English

/ru           Russian
/ru/try       Russian
```

SEO:
- canonical;
- hreflang;
- localized metadata;
- localized sitemap where relevant.

## 19.2 Application

Locale **не включается** в app URL.

Не нужно:

```text
app.elmorf.com/ru/projects/...
```

Application locale определяется preference/request context.

URL должен оставаться стабильным независимо от языка.

---

# 20. Locale resolution — app

Приоритет:

```text
1. authenticated user preference
2. locale cookie
3. Accept-Language
4. en
```

Mock mode:
- cookie/preference adapter;
- default from browser;
- settings change works immediately.

---

# 21. Locale resolution — site

Приоритет URL.

Если locale отсутствует:
- English default;
- optional first-visit negotiation может redirect/offer locale,
- но не создавать aggressive redirect, который мешает SEO/explicit URLs.

---

# 22. Message organization

Не создавать один `messages/en.json` на 5000 строк без структуры.

Кандидат:

```text
messages/
├── en/
│   ├── common.json
│   ├── navigation.json
│   ├── auth.json
│   ├── overview.json
│   ├── data.json
│   ├── compile.json
│   ├── morphology.json
│   ├── query.json
│   ├── settings.json
│   └── errors.json
└── ru/
    └── ...
```

Load/composition можно адаптировать под next-intl configuration.

---

# 23. Translation key rules

Использовать semantic keys:

```text
Data.addSource
Compile.start
Morphology.views.graph
Query.run
Errors.compilationFailed
```

Не использовать:

```text
"Add data": "Add data"
```

Не использовать index keys:

```text
button1
label3
text17
```

---

# 24. Hardcoded UI copy

В product components запрещены hardcoded user-facing строки.

Допустимы:
- brand `Elmorf`;
- protocol/code names;
- raw enum codes только внутри mapping;
- code examples;
- user/source content.

Плохо:

```tsx
<Button>Add data</Button>
```

Правильно:

```tsx
const t = useTranslations('Data');
<Button>{t('addSource')}</Button>
```

Server Component:
- `getTranslations`.

---

# 25. ICU / plurals

Все count-dependent сообщения используют ICU.

Не делать:

```ts
`${count} source${count === 1 ? '' : 's'}`
```

Использовать locale-aware plural messages.

Особенно важно для Russian plural rules.

---

# 26. Date, time, number formatting

Запрещать ручные:

```ts
date.toLocaleString(...)
number.toFixed(...)+ ' ms'
```

если пользовательский display зависит от locale.

Использовать next-intl formatter:
- date;
- time;
- relative time;
- number;
- percent.

Технические raw IDs/ISO timestamps в diagnostics могут оставаться canonical.

---

# 27. Backend enums и i18n

Backend/API должен отдавать stable codes:

```text
processing
ready
failed
company
signed
```

Frontend:
- маппит code → translated label.

Backend не должен присылать английскую строку как UI label, если label является системным понятием.

---

# 28. Backend errors и i18n

Предпочтительный API error:

```json
{
  "code": "COMPILATION_FLESH_FAILED",
  "message": "...optional developer fallback...",
  "details": {}
}
```

Frontend:
- map error code → localized user copy;
- raw backend message только в technical details/fallback.

---

# 29. User/source content не переводим

Не локализовать автоматически:
- source titles;
- object identity;
- attributes;
- evidence snippets;
- query text;
- uploaded content.

i18n отвечает за product chrome, не за пользовательские данные.

---

# 30. RTL readiness

Даже если initial locales `en/ru` LTR, foundation должен быть RTL-safe.

## 30.1 HTML

```text
lang = locale
dir = locale direction
```

## 30.2 CSS

Предпочитать logical properties:

```text
ms / me
ps / pe
start / end
inset-inline-*
```

Вместо:

```text
ml / mr
pl / pr
left / right
```

когда направление семантическое.

## 30.3 shadcn

В foundation включить RTL compatibility.

Если shadcn CLI/setup требует migration/config:

```text
rtl: true
```

Использовать официальный RTL migration/conventions.

Initial visual QA:
- LTR full;
- RTL structural smoke test с pseudo/temporary RTL locale до первого release.

---

# 31. Locale switcher

## Site

Compact:

```text
EN
RU
```

или locale menu.

## App

`Settings → Appearance / Language` либо account preferences.

Topbar language switch не обязателен.

Locale switch:
- сохраняет current page;
- не теряет form data неожиданно;
- применяет `lang/dir`.

---

# 32. Pseudo-localization

Для development добавить pseudo locale или development transformation, которая:
- удлиняет строки;
- помогает найти hardcoded text;
- выявляет clipping.

Не обязательно публично route-ить pseudo locale.

CI/story visual test может использовать его.

---

# 33. Authentication boundary

Первый mock frontend использует abstraction:

```text
AuthClient
```

Пример interface:

```ts
interface AuthClient {
  getSession(): Promise<Session | null>;
  signIn(input: SignInInput): Promise<Session>;
  signUp(input: SignUpInput): Promise<Session>;
  signOut(): Promise<void>;
}
```

Mock implementation через MSW.

Позже adapter заменяется реальным auth API.

Не привязывать UI напрямую к конкретному auth SaaS, если решение ещё не принято.

---

# 34. Authorization

UI должен быть готов к capabilities/permissions.

Не hardcode:

```ts
const canDelete = true;
```

Domain model:

```ts
type ProjectCapabilities = {
  canAddData: boolean;
  canCompile: boolean;
  canManageApiKeys: boolean;
  canDeleteProject: boolean;
};
```

Mock fixtures должны включать limited user scenario.

UI:
- hide/disable based on semantics;
- backend всё равно является security authority.

---

# 35. API client architecture

`packages/api-client`

Слои:

```text
HTTP transport
    ↓
API error normalization
    ↓
endpoint functions
    ↓
Zod validation
    ↓
TanStack query options/hooks
```

Не делать fetch в React component.

---

# 36. HTTP transport

Один общий request wrapper.

Ответственность:
- base URL;
- auth;
- content type;
- abort signal;
- request ID;
- error normalization;
- JSON parse;
- Zod boundary integration.

Не превращать wrapper в ORM.

---

# 37. Environment variables

Public:

```text
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_APP_ENV
NEXT_PUBLIC_MOCK_MODE
```

Секреты не имеют `NEXT_PUBLIC_`.

Создать Zod env schema.

App должен fail fast на invalid environment.

---

# 38. API base URL

Никаких endpoint strings внутри feature component.

Пример:

```ts
api.projects.get(projectId)
api.sources.list(projectId, params)
api.compilations.start(projectId)
api.morphology.graph(projectId, params)
```

---

# 39. Zod boundary

Все mock fixtures обязаны проходить те же Zod schemas, что API responses.

Это предотвращает:
> «мок работает, настоящий API нет».

Для high-volume payload later допускается оптимизация после profiling, но schema contract остаётся.

---

# 40. API error type

Единый normalized error:

```ts
type ElmorfApiError = {
  code: string;
  status?: number;
  message?: string;
  details?: unknown;
  requestId?: string;
  retryable: boolean;
};
```

Компоненты не разбирают произвольные `fetch` exceptions.

---

# 41. TanStack Query

Server state принадлежит TanStack Query.

Использовать:
- `queryOptions`;
- stable query keys;
- mutations;
- invalidation;
- cancellation.

Не хранить API data копией в Zustand.

---

# 42. Query key factory

Пример:

```ts
projectKeys.all
projectKeys.detail(projectId)

sourceKeys.all(projectId)
sourceKeys.list(projectId, filters)
sourceKeys.detail(projectId, sourceId)

compileKeys.current(projectId)
compileKeys.history(projectId)

morphologyKeys.graph(projectId, modelVersion, filters)
morphologyKeys.objects(...)
morphologyKeys.relations(...)
```

Key должен включать всё, что меняет server result.

---

# 43. Query defaults

Не использовать глобально:
- `staleTime: Infinity`;
- агрессивный polling.

Defaults:
- sensible stale time;
- refetch on focus только где полезно;
- retry based on error retryability.

Long-running process:
- conditional polling;
- stop when terminal state.

---

# 44. Long-running operation model

Processing и Compile моделируются как async jobs.

Mock API воспроизводит:

```text
queued
running
completed
failed
cancelled
```

UI не предполагает, что mutation response означает «работа закончена».

---

# 45. Polling

Если websocket/SSE пока нет:

- Query polling;
- frequency reasonable;
- disabled when terminal;
- paused in hidden tab if appropriate.

Архитектурно endpoint hook не должен мешать позже заменить polling на SSE/WebSocket.

---

# 46. Zustand ownership

Zustand только для client/workspace state.

Примеры:

```text
inspector width
inspector open
local graph preferences
selected transient graph items
query editor draft if not URL/server
table column preferences
```

Не хранить:
- Projects;
- Sources;
- Compilations;
- Objects;
- API keys.

---

# 47. URL state

URL — source for shareable state.

Morphology candidate:

```text
?view=graph
&model=v17
&object=obj_123
&type=company
&conflict=1
```

Не кодировать огромный graph viewport query string.

Query saved ID:
- route/search param if backend entity exists.

---

# 48. Forms

```text
React Hook Form
+
Zod
+
shadcn Field/Form primitives
```

## 48.1 Pattern

```text
schema
default values
form
mutation
localized errors
```

## 48.2 Server errors

Map:
- field errors → field;
- global error → form alert/toast.

Не терять введённые данные после server error.

---

# 49. Toast policy

Sonner.

Toast:
- meaningful completion;
- failure requiring awareness;
- important user action confirmation.

Не использовать toast вместо:
- inline validation;
- persistent error;
- progress UI.

---

# 50. MSW mock architecture

MSW — обязательный boundary.

Browser code делает настоящий HTTP request к configured base URL.

В mock mode Service Worker перехватывает его.

Flow:

```text
Component
→ feature hook
→ API client
→ fetch
→ MSW
→ fake store
```

---

# 51. Mock mode

Env:

```text
NEXT_PUBLIC_MOCK_MODE=true
```

Dev:
- MSW start before app becomes interactive;
- visible tiny development indicator может быть доступен только dev.

Production deployment для demo `/try` может использовать dedicated mock/demo backend adapter, но не должен случайно включить developer mock mode для app.elmorf.com.

---

# 52. Mock store

Не делать handlers как статические JSON responses.

Создать in-memory fake backend store:

```text
projects
sources
compilations
models
objects
relations
queries
apiKeys
session
```

Mutation реально меняет fake state.

Refresh может reset fixtures — допустимо для dev.

При необходимости local persistence включается отдельно.

---

# 53. Deterministic fixtures

Faker seeded.

Одинаковый seed:
- screenshots стабильны;
- tests стабильны;
- Cursor не видит каждый запуск другой мир.

Основной seed dataset:

```text
Vendor Contracts
```

---

# 54. Demo domain data

Project:

```text
Vendor Contracts
```

Sources:
- PDF contracts;
- CSV vendor master;
- XLSX pricing;
- DOCX annexes;
- ZIP batch.

Objects:
- Company;
- Person;
- Contract;
- Invoice;
- Address;
- Product.

Relations:
- SIGNED;
- WORKS_FOR;
- BELONGS_TO;
- SUPPLIES;
- LOCATED_AT.

Конкретные имена synthetic.

Не использовать реальные компании как будто это их данные.

---

# 55. Mock scenarios

Обязательные scenario presets:

```text
happy
empty
processing
compile-running
compile-failed
partial
conflicts
large-graph
api-error
permission-limited
slow-network
```

Scenario selector может быть dev-only.

---

# 56. Mock latency

Default:
- 80–300ms routine;
- long process via job state.

Slow scenario:
- 1–3s selected endpoints.

Не ставить везде искусственные 2 секунды, иначе development UX становится мучением.

---

# 57. Domain schemas

Минимум:

```text
ProjectSchema
ProjectCapabilitiesSchema

SourceSchema
SourceProcessingSchema

CompilationSchema
CompilationStageSchema
ModelSummarySchema

CompiledObjectSchema
ObjectAttributeSchema
RelationSchema
EvidenceSchema
ConflictSchema

GraphResponseSchema

QueryRequestSchema
QueryExecutionSchema
QueryResultSchema

ApiKeySchema
UserPreferencesSchema
SessionSchema

ApiErrorSchema
```

---

# 58. ID types

Не делать branded types чрезмерно сложными, но избегать путаницы.

Допустимо:

```ts
type ProjectId = string;
type SourceId = string;
type ObjectId = string;
```

или Zod branded types, если это реально улучшит correctness.

Главное:
- parameter names конкретные;
- не передавать `id: string` без контекста в сложные функции.

---

# 59. App providers

Минимизировать global provider nesting.

Candidate:

```tsx
<html>
  <body>
    <ThemeProvider>
      <IntlProvider>
        <QueryProvider>
          <App>{children}</App>
        </QueryProvider>
      </IntlProvider>
    </ThemeProvider>
  </body>
</html>
```

MSW bootstrap только dev/mock path.

TooltipProvider там, где shadcn требует, может быть global.

---

# 60. Application shell implementation

Использовать:
- shadcn Sidebar / Radix-backed primitives;
- shared shell components;
- CSS grid/flex;
- Resizable для inspector.

Компоненты:

```text
AppShell
AppSidebar
AppTopbar
ProjectSwitcher
GlobalSystemStatus
Workspace
InspectorHost
UserMenu
CommandPalette
```

---

# 61. Sidebar implementation

Width token:

```text
232px
```

Desktop:
- persistent;
- no icon-only collapse.

Tablet:
- off-canvas shadcn Sidebar.

Nav config:

```ts
[
  {key: 'overview', ...},
  {key: 'data', ...},
  {key: 'compile', ...},
  {key: 'morphology', ...},
  {key: 'query', ...}
]
```

Labels через i18n.

Не hardcode JSX nav пять раз.

---

# 62. Active route

Active определять из pathname/route.

Не хранить active section в Zustand.

URL — authority.

---

# 63. ProjectSwitcher implementation

Data:
- project list query;
- current project from route param.

Components:
- Button/Popover or Dropdown/Command composition;
- search;
- create project.

Keyboard:
- searchable;
- arrows;
- Enter;
- Escape.

Radix/shadcn behavior.

---

# 64. GlobalSystemStatus implementation

Reads:
- processing summary query;
- active compilation query;
- current model.

Compact display.

Popover detail.

Polling low frequency only while something active.

---

# 65. Command palette

`⌘K / Ctrl+K`.

Use:
- shadcn Command;
- Radix Dialog.

Sources:
- static navigation commands;
- project list;
- object search API;
- recent items.

Search remote objects debounce/cancel.

Do not load entire morphology into Command.

---

# 66. Resizable inspector

Use `react-resizable-panels` or shadcn Resizable wrapper.

Store local width:
- Zustand or localStorage preference.

Do not persist width in backend.

On narrow viewport:
- Sheet.

---

# 67. Overview feature architecture

```text
features/overview/
├── api/
├── components/
├── queries/
├── schemas/ # only if feature-specific
└── overview-page.tsx
```

Page component:
- compose;
- no giant 1000-line JSX.

Subcomponents:
- ModelSummary;
- ProjectHealth;
- ModelGrowthChart;
- ProcessingSummary;
- RecentActivity.

---

# 68. Data feature

Components:

```text
DataPage
DataToolbar
SourceTable
SourceStatus
AddDataDialog
SourceDropzone
SourceInspector
ProcessingDetails
SourceErrorDetails
DeleteSourceDialog
```

---

# 69. Upload mock

Mock UI must support:

- file selection;
- drag drop;
- multiple files;
- per-file state;
- cancel before submit;
- mutation creates Source records.

Не читать/парсить реальные file contents в первом mock frontend, если это не нужно для demo.

Filename/type/size достаточно.

---

# 70. Data table

TanStack Table.

State:
- search;
- status filters;
- type filters;
- sorting.

Shareable filters:
- URL where reasonable.

Column prefs:
- local.

Virtualization:
- enable fixture/large mode.

---

# 71. Compile feature

Components:

```text
CompilePage
CurrentModelSummary
CompileButton
CompilationPipeline
CompilationStage
CompilationLog
CompilationHistoryTable
CompilationResult
CompilationError
```

---

# 72. Compile mutation

Flow:

```text
POST start
→ returns Compilation {status: queued/running}
→ update query cache
→ poll detail/current
→ terminal state
→ invalidate model summary + morphology + overview
```

Cancel:

```text
POST cancel
→ update job
→ polling resolves terminal
```

---

# 73. Compilation logs

Virtualized if large.

UI filters:
- all;
- info;
- warning;
- error.

Search optional.

Log entry:

```ts
{
  timestamp,
  level,
  stage,
  message,
  context?
}
```

Message from backend may be technical and not translated.
UI chrome translated.

---

# 74. Morphology feature boundary

`packages/graph` provides graph infrastructure.

`apps/app/features/morphology` provides product interaction.

Never import Sigma directly from random page components.

---

# 75. Graph DTO

Frontend-neutral API contract:

```ts
type GraphNodeDto = {
  id: ObjectId;
  type: string;
  label: string;
  confidence?: number;
  conflictCount?: number;
  metrics?: {
    degree?: number;
    centrality?: number;
  };
};

type GraphEdgeDto = {
  id: RelationId;
  source: ObjectId;
  target: ObjectId;
  type: string;
  directed: boolean;
  confidence?: number;
};

type GraphResponse = {
  modelVersion: string;
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
  meta: {
    totalNodes: number;
    totalEdges: number;
    truncated: boolean;
  };
};
```

Exact backend contract may later differ, adapter boundary stays.

---

# 76. Graph adapter

Pure functions:

```text
createGraphologyGraph(dto)
applyNodeVisualState(...)
applyEdgeVisualState(...)
applyFilters(...)
deriveNeighbourhood(...)
```

Test without React/Sigma where possible.

---

# 77. Sigma component

`MorphologyCanvas`

Responsibilities:
- create/dispose renderer;
- resize;
- camera;
- pointer events;
- selection bridge;
- visual refresh.

Не:
- fetch data;
- parse URL;
- manage inspector content;
- translate business labels.

---

# 78. Graph layout

ForceAtlas2:
- worker;
- cancellable;
- never block UI thread.

Small graph may use synchronous initial layout only if profiling says safe.

UI states:
- preparing;
- layouting;
- ready.

---

# 79. Large graph protection

Before rendering:
- inspect counts;
- respect server truncation;
- show aggregate mode if needed.

Never attempt “render everything because WebGL”.

Policies:
- server-side graph query;
- filtering;
- cluster/LOD;
- edge reduction.

Mock `large-graph` scenario must exercise protection.

---

# 80. Graph selection

Single selection baseline.

Selection source:
- URL object/relation param where shareable.

Transient hover:
- local renderer state.

Selected node:
- inspector;
- focused visual state;
- keyboard Escape clears selection.

---

# 81. Graph search

Search field calls server/object search.

Selecting result:
- ensure object present/fetch neighbourhood;
- focus camera;
- select;
- open inspector.

Не делать client scan единственным search для production design.

---

# 82. Graph filters

Filters:
- object type;
- relation type;
- conflicts;
- optional confidence.

Filter state:
- URL.

Filter change:
- debounce if server call;
- preserve selection if still valid;
- clear selection with explanation if filtered out.

---

# 83. Objects projection

TanStack Table + TanStack Virtual.

Same domain object inspector.

Route:
```text
/morphology?view=objects
```

Selected:
```text
&object=obj_x
```

---

# 84. Relations projection

Same principles.

Selected:
```text
&relation=rel_x
```

Inspector uses relation query/detail.

---

# 85. Evidence component

Shared:

```text
EvidenceList
EvidenceItem
EvidenceLocator
EvidenceSnippet
```

Evidence source types render locator appropriately.

Do not switch on dozens of types inside one JSX file; use formatter registry.

---

# 86. Object inspector queries

Selected object ID triggers:
- object detail;
- relations summary;
- evidence as needed.

Prefer query per tab if payload heavy.

Do not fetch 50MB evidence data because inspector opened.

---

# 87. Query feature

Components:

```text
QueryPage
QueryModeSwitch
QueryEditor
QueryRunButton
QueryResultTabs
JsonResult
TableResult
GraphResult
ExecutionMetadata
EvidencePanel
GeneratedCode
QueryHistory
```

---

# 88. Query editor technology

First version:
- textarea/editor abstraction;
- structured mode may later use CodeMirror/Monaco.

Do **not** add Monaco at foundation unless Structured Query syntax truly needs IDE features.

Bundle cost matters.

Create interface boundary:

```ts
<QueryEditor mode="natural" />
<QueryEditor mode="structured" />
```

so editor engine can change later.

---

# 89. Query execution

Mutation/job depending backend semantics.

Request includes:

```text
projectId
modelVersion
mode
query
options
```

Response includes:
- result type;
- objects/relations;
- evidence;
- timing;
- modelVersion.

---

# 90. Query result polymorphism

Use discriminated union:

```ts
type QueryResult =
  | {kind: 'object'; ...}
  | {kind: 'objects'; ...}
  | {kind: 'table'; ...}
  | {kind: 'graph'; ...}
  | {kind: 'scalar'; ...}
  | {kind: 'empty'; ...};
```

Renderer switches exhaustively.

Не `unknown JSON blob` throughout UI.

---

# 91. JSON viewer

First version:
- syntax-highlighted code;
- copy;
- collapse optional.

Не устанавливать 300KB viewer library без need.

Use lightweight component.

---

# 92. Generated code

Code generator is pure function from query request.

```text
generatePythonQuery(...)
generateHttpQuery(...)
```

Golden tests ensure displayed code matches contract.

Do not construct code snippets ad hoc in JSX.

---

# 93. Settings feature

Project settings and account settings separate routes.

Forms use common settings section layout.

Components:
- SettingsNav;
- SettingsSection;
- SettingRow.

Avoid giant one-page settings form.

---

# 94. API key mock

Create mutation returns secret once:

```ts
{
  id,
  name,
  prefix,
  secret,
  createdAt
}
```

Subsequent list:
- no secret.

UI must model this now.

---

# 95. Integration placeholder

Если реальных integrations нет:

- section может быть hidden;
- либо honest empty state.

Не рисовать fake Slack/Salesforce integration grid без product requirement.

---

# 96. Landing implementation

Use Server Components by default.

Interactive parts:
- theme toggle;
- SDK demo;
- graph demo;
- mobile nav.

Dynamic import graph demo.

Не включать Sigma in initial hero JS unless the hero absolutely depends on it.

Prefer below-the-fold dynamic loading.

---

# 97. Landing performance budget

Target principles:

- static/SSR text immediately;
- minimal client JS;
- image/vector optimized;
- no giant animation libraries loaded globally;
- graph/demo lazy loaded.

Marketing site performance has higher priority than reusing application-heavy bundles.

---

# 98. `/try` implementation

`apps/site`.

Can import shared:
- `packages/ui`;
- `packages/graph`;
- selected Query/Morphology presentation components.

But avoid importing entire `apps/app`.

Reusable product views that need both apps should move to a package/shared boundary deliberately.

No cross-app relative imports.

---

# 99. Auth implementation

`apps/app`.

Forms:
- RHF + Zod;
- mock AuthClient;
- locale aware;
- theme aware.

Auth pages not wrapped in workspace shell.

---

# 100. SEO

Site only.

Per locale:
- title;
- description;
- canonical;
- hreflang;
- OpenGraph;
- robots;
- sitemap.

Application:
- `noindex` by default.

Auth:
- `noindex`.

---

# 101. Metadata i18n

Use `getTranslations` in metadata generation.

Не hardcode English metadata for Russian route.

---

# 102. Accessibility

Baseline:
- semantic HTML;
- Radix behavior;
- focus visible;
- keyboard;
- aria labels;
- status announcements for async operations where useful.

Test with:
- keyboard-only;
- Playwright accessibility flows;
- optional axe integration.

---

# 103. Graph accessibility

Canvas/WebGL graph cannot be sole data representation.

Provide:
- Objects;
- Relations;
- search;
- inspector.

Canvas controls:
- labelled buttons;
- keyboard accessible toolbar.

Selected object information exposed outside canvas.

---

# 104. Reduced motion

Global media query / MotionConfig.

When reduced:
- no smooth graph camera animation or strongly reduced;
- panel transitions minimal;
- no decorative motion.

---

# 105. Storybook architecture

Recommended framework:

```text
@storybook/nextjs-vite
```

Storybook current docs recommend Next.js+Vite for most Next.js projects.

Primary Storybook can live:
- at repo root consuming `packages/ui`;
- plus feature stories.

---

# 106. Storybook decorators

Global:
- theme;
- intl;
- QueryClient;
- router mocks;
- MSW.

Toolbar:
- light/dark;
- locale en/ru;
- viewport.

Every important story should be testable in:
- dark/en;
- light/en;
- dark/ru.

Selected critical stories:
- light/ru too.

---

# 107. Storybook theme testing

Theme toggle in Storybook controls same CSS class/provider as production.

Не делать special Storybook-only theme CSS.

---

# 108. Storybook i18n testing

Locale toolbar changes:
- messages;
- lang;
- dir.

Add pseudo locale for clipping stories.

---

# 109. Vitest

Unit/component tests:
- pure domain;
- Zod schemas;
- graph adapter;
- code generators;
- feature utilities;
- components where DOM behavior valuable.

Не unit-test every Tailwind class.

---

# 110. Testing Library

Focus on user behavior.

Examples:
- project switcher keyboard;
- dialog validation;
- status state;
- query result tab;
- API key reveal.

Radix portal setup must be accounted for.

---

# 111. Playwright

Critical E2E:

```text
landing → try
signup/login mock
create project
add data
processing completes
compile starts
compile completes
open morphology
select object
open evidence
run query
switch theme
switch locale
reload preserves preference
```

---

# 112. Theme E2E

Test:

1. dark explicit;
2. light explicit;
3. system dark mocked;
4. system light mocked;
5. hard reload;
6. no hydration mismatch visible.

---

# 113. i18n E2E

Test:
- English;
- Russian;
- locale switch;
- URL preservation;
- date/number formatting;
- plural;
- no missing key warnings;
- no obvious clipping.

---

# 114. MSW tests

Handlers should be reusable:
- Storybook;
- Vitest browser/jsdom where appropriate;
- Playwright mock mode if architecture permits.

Do not maintain three unrelated mock datasets.

---

# 115. Error boundaries

Use Next.js:
- route-level `error.tsx`;
- `not-found.tsx`;
- loading boundaries where sensible.

Feature errors:
- localized functional errors;
- retry.

Do not show raw Next error page inside product in expected API failure.

---

# 116. Loading boundaries

Use route loading only when useful.

Prefer:
- preserve shell;
- preserve previous server state;
- skeleton local section.

Navigation should feel app-like, not blank page reload.

---

# 117. Suspense

Use intentionally.

Do not wrap every component in Suspense because Next supports it.

Good:
- independently loadable panel;
- server streamed section;
- lazy graph.

Bad:
- 20 tiny fallback flashes.

---

# 118. Code splitting

Lazy/dynamic candidates:
- Sigma graph;
- ForceAtlas worker;
- Recharts heavy views if needed;
- Structured editor engine;
- advanced logs.

Core shell stays lean.

---

# 119. Bundle policy

CI may track:
- build output;
- route bundle changes.

No hard numeric budget initially, but large dependency additions require review.

Landing especially protected.

---

# 120. Performance telemetry hooks

Create abstraction points for future telemetry:
- navigation timing;
- query duration;
- graph render duration;
- compile UI state latency.

Do not implement analytics vendor until chosen.

No vendor-specific calls sprinkled across features.

---

# 121. Logging

Frontend internal logger abstraction.

Levels:
- debug;
- info;
- warn;
- error.

Production:
- no noisy console spam.

API request IDs included in error diagnostics.

---

# 122. Error reporting boundary

Prepare adapter:

```ts
reportError(error, context)
```

Initially:
- console/dev.

Later:
- Sentry/other.

UI code doesn't import vendor directly.

---

# 123. Accessibility and test IDs

Prefer accessible selectors.

`data-testid` only when semantic selector is not reliable.

Do not cover every element with test ids.

---

# 124. CSS conventions

Tailwind first.

Custom CSS for:
- tokens;
- Sigma canvas;
- very specific component behavior.

Avoid:
- huge global component stylesheet;
- CSS modules for every shadcn component unless necessary.

---

# 125. Logical CSS direction

Mandatory for future RTL:

Prefer:

```text
ms-
me-
ps-
pe-
start-
end-
rounded-s-
rounded-e-
```

when direction matters.

Physical geometry allowed only when actually physical:
- canvas coordinate;
- fixed graph control placement intentionally independent of locale, though even controls generally should mirror.

---

# 126. Icons and RTL

Directional icons:
- chevrons;
- arrows;
- panel expansion

must mirror where semantic direction changes.

Non-directional:
- search;
- settings;
- database

do not.

---

# 127. Design tokens package

`packages/ui/styles/tokens.css`

Contains:
- light root;
- dark class;
- shared dimensions;
- semantic graph/chart vars.

No feature package duplicates brand palette.

---

# 128. Tailwind conventions

Use semantic utilities:

```text
bg-background
bg-card
text-foreground
text-muted-foreground
border-border
ring-ring
```

Use Elmorf custom var utility only when semantic shadcn token insufficient.

No raw arbitrary colors in product code.

---

# 129. Class composition

Use standard shadcn `cn()`.

Variants:
- `class-variance-authority`.

Do not concatenate brittle strings manually.

---

# 130. Server vs Client rules

Server Component by default for:
- static page structure;
- metadata;
- marketing content;
- server prefetch where beneficial.

Client Component for:
- graph;
- form;
- popover interaction;
- local state;
- Query hooks;
- theme/locale client interaction.

Keep client boundary low.

---

# 131. Data prefetch/hydration

For app pages where first data is predictable:
- server QueryClient prefetch + HydrationBoundary may be used.

But mock-first implementation can begin client fetch if it keeps architecture simpler.

Do not over-engineer SSR data fetching before real API auth semantics are known.

Architecture should allow upgrade.

---

# 132. Cache semantics

Do not mix Next fetch cache and TanStack Query cache randomly for the same mutable API domain.

Default application dynamic data:
- TanStack Query owns client cache.

Public content:
- Next static/cache mechanisms.

---

# 133. Feature module boundaries

Feature cannot import internals of another feature arbitrarily.

Allowed:
- `packages/*`;
- public feature exports.

Shared component used by multiple features:
- promote to shared/domain package only when reuse real.

Avoid `shared` dumping ground from day one.

---

# 134. Naming files

Prefer explicit:

```text
source-table.tsx
source-status.tsx
use-sources-query.ts
source-query-options.ts
```

Avoid:

```text
component.tsx
utils2.ts
helpers.ts
common.ts
```

---

# 135. Barrel exports

Use sparingly.

Package public API can have `index.ts`.

Inside feature, avoid deep barrel chains that:
- hide dependencies;
- cause cycles;
- hurt tree shaking/debug.

---

# 136. Import aliases

Repo-level alias style:

```text
@elmorf/ui
@elmorf/domain
@elmorf/api-client
@elmorf/graph
@elmorf/mocks
@elmorf/i18n
```

App local:

```text
@/features/...
@/components/...
```

---

# 137. Domain/UI separation

UI label enum example:

Domain:
```ts
type SourceStatus = 'queued' | 'processing' | 'ready' | 'failed';
```

UI:
```ts
getSourceStatusPresentation(status, t)
```

Do not put translated strings in domain schema.

---

# 138. Date storage

API/domain:
- ISO 8601 strings with timezone/UTC contract.

UI:
- parse/format locale/timezone.

Do not store formatted date as domain value.

---

# 139. User timezone

Foundation:
- browser timezone for anonymous;
- future account preference override.

All display formatting goes through a helper/next-intl formatter.

Do not assume UTC in UI copy.

---

# 140. Number units

Bytes:
- shared formatter.

Durations:
- shared formatter.

Percent:
- shared formatter.

Counts:
- locale number format.

Do not create five slightly different `formatBytes`.

---

# 141. Project routes and invalid IDs

Unknown project:
- localized not-found/access state.

Do not leave shell with infinite spinner.

If project deleted while open:
- invalidate;
- navigate project picker;
- toast.

---

# 142. Stale model semantics

Data can be newer than current model.

Domain:

```ts
type ModelFreshness = {
  currentVersion: string;
  uncompiledSourceCount: number;
  isStale: boolean;
};
```

Use in Overview/Compile/Query.

Query defaults current compiled model, not raw latest sources.

---

# 143. Model version selector

Shared component:

```text
ModelVersionSelect
```

Default:
- current.

Old versions:
- explicit visual indication.

Morphology/Query can select version if API supports.

If backend does not yet support history queries, component remains hidden.

---

# 144. Feature flags

Simple abstraction:

```ts
type FeatureFlags = {
  queryStructuredMode: boolean;
  modelHistory: boolean;
  integrations: boolean;
};
```

Mock/dev flags okay.

Do not install enterprise feature flag platform yet.

---

# 145. No speculative UI

If backend/domain feature absent:
- hide or mark clearly as planned only in design docs;
- don't ship fake controls.

Examples:
- Compare model versions;
- Integrations;
- Organization roles.

---

# 146. Security basics

Frontend:
- no secret in env public;
- sanitize/render user content safely;
- no `dangerouslySetInnerHTML` for evidence unless sanitized pipeline contract exists;
- links use safe targets;
- auth tokens not casually stored in localStorage if real auth architecture uses secure cookie.

Mock auth does not dictate production credential storage.

---

# 147. Evidence rendering safety

Evidence snippets treated as text by default.

If backend later emits marked-up evidence:
- explicit safe schema;
- sanitizer;
- renderer whitelist.

Never trust source HTML directly.

---

# 148. File upload security UX

Frontend validation:
- supported extension;
- size;
- count.

But server remains authority.

Frontend errors translated.

Do not promise that frontend validation secures file content.

---

# 149. Graph labels safety

Object labels may contain arbitrary source text.

Render as text.

No HTML injection into Sigma label DOM/custom canvas path.

---

# 150. Keyboard baseline

Global:
```text
Cmd/Ctrl + K → command
Esc → close/clear topmost transient context
```

Dialog/Menu/Popover:
- Radix keyboard semantics.

Graph:
- toolbar keyboard;
- selection details accessible through search/table.

No huge custom shortcut map in v1.

---

# 151. Browser support

Target modern evergreen desktop browsers.

At minimum:
- current Chrome;
- current Firefox;
- current Safari;
- current Edge.

Mobile public:
- iOS Safari;
- Chrome Android.

Application mobile has reduced feature expectations per Design System.

Exact minimum versions follow Next.js/dependency support policy and should be documented in README once dependencies installed.

---

# 152. Service worker interaction

MSW service worker:
- dev/mock only;
- clear separation from any future PWA/service worker.

Do not accidentally register MSW in production app deployment.

---

# 153. CI pipeline

PR minimum:

```text
install
lint
typecheck
unit tests
storybook build
app builds
site build
Playwright smoke
```

Potential parallelization through Turbo.

---

# 154. Build security

Because Next.js receives frequent security patches:

- Dependabot/Renovate equivalent recommended;
- Next.js security patch PRs prioritized;
- lockfile committed.

Do not ignore Active LTS security advisories.

---

# 155. Pre-commit

Optional:
- lint-staged;
- fast lint/format.

Do not run full Playwright on every local commit.

CI is authority.

---

# 156. README

Root README must explain:
- repo structure;
- prerequisites;
- install;
- dev;
- mock mode;
- theme;
- locale;
- Storybook;
- tests;
- adding shadcn component;
- adding translation;
- adding endpoint/fixture.

Cursor must generate this.

---

# 157. Adding shadcn component procedure

1. confirm component exists;
2. run shadcn CLI in `packages/ui` configured for Radix;
3. apply Elmorf tokens/variants;
4. add Storybook story;
5. do not rewrite behavior.

Document in README.

---

# 158. Adding a new product component

Checklist:

```text
Is this generic UI?
→ packages/ui

Is this reusable domain presentation?
→ appropriate shared package

Is this feature-specific?
→ feature directory
```

Do not move everything into `packages/ui`.

---

# 159. Adding translation procedure

1. add English canonical key;
2. add Russian translation;
3. use ICU for dynamic grammar;
4. no hardcoded fallback inside component;
5. Storybook/CI catches missing key.

---

# 160. Adding a new locale later

Must require only:

```text
locale config
messages
metadata translations
optional font changes
QA
```

Should not require:
- refactoring routes in app;
- rewriting components;
- changing CSS left/right;
- replacing date helpers.

Это критерий правильного i18n foundation.

---

# 161. Adding a new theme later

Should require:
- semantic token set;
- optional theme selector entry.

Should not require:
- touching feature components;
- replacing raw HEX;
- rewriting charts;
- rewriting graph state logic.

Это критерий правильной theme architecture.

---

# 162. Graph theme integration

Sigma styling reads semantic theme values.

Theme change:
- triggers renderer style refresh;
- does not rebuild graph domain data if unnecessary.

Graph does not hardcode dark colors.

Test switching theme with active selection.

---

# 163. Chart theme integration

Chart colors from CSS variables.

Recharts config does not hardcode dark palette.

Tooltip/popover uses shadcn theme surface.

---

# 164. Code highlighting theme

Code/JSON surfaces:
- light syntax theme;
- dark syntax theme.

If using syntax highlighter, choose one supporting theme tokens or two explicit themes.

Do not force dark code block in light UI unless design specifically wants it.

---

# 165. Landing theme behavior

Dark is default brand presentation candidate.

But if user chooses light/system light:
- full landing remains intentionally designed;
- graph/code visuals adapt.

SEO screenshots/social media can still use dark canonical brand art.

---

# 166. Theme default decision

Product behavior:

```text
defaultTheme = system
```

Brand previews/docs may show dark.

Reason:
- respect OS;
- both themes implemented anyway.

If later product decision chooses default dark, only provider config changes.

---

# 167. Locale default decision

```text
defaultLocale = en
```

Elmorf product/source copy canonical in English.

Russian maintained as supported locale.

---

# 168. Query input language

Natural Query accepts any user language supported by backend/model semantics.

UI locale does **not** constrain query language.

Russian UI can send English query; English UI can send Russian query.

Do not auto-translate query text in frontend.

---

# 169. Source language

Source language unrelated to UI locale.

No implicit source filtering by locale.

---

# 170. Accessibility localization

ARIA labels translated.

Tooltip labels translated.

Screen reader status translated.

Do not leave English aria labels inside Russian UI.

---

# 171. Page title localization

Browser title:
- localized;
- project name remains source/user content.

Example:

```text
Morphology · Vendor Contracts · Elmorf
```

Russian:
localized `Morphology` equivalent, project unchanged.

---

# 172. Empty/error localization

All states localizable.

Mock technical log text may remain English if representing backend log stream, but chrome labels localized.

---

# 173. Project create flow implementation

`/projects/new`

Simple form:
- name;
- optional description.

After mutation:
- navigate `/projects/{id}/overview`.

No onboarding survey.

---

# 174. First-run flow

If no projects:

`/projects` shows:
- short explanation;
- Create project CTA.

After project:
- Overview empty state → Add data.

No mandatory multi-step wizard.

---

# 175. Data upload to Compile transition

When all relevant sources ready and no model exists:
- Overview/Data may surface `Compile first model`.

But do not automatically compile unless product explicitly decides.

User action remains explicit in v1.

---

# 176. Compile completion transition

Do not force route change.

Show:
```text
Model vN compiled
[Open morphology] [Run query]
```

User chooses.

---

# 177. Search params parsing

Use Zod or typed parser abstraction for complex filters.

Do not cast query params manually everywhere.

Candidate helper:
- own lightweight parser;
- no additional routing-state library unless needed.

---

# 178. URL serialization

Only stable, readable codes.

Do not serialize entire JSON filter object as base64 for simple filters.

---

# 179. Tables and i18n

Column header labels translated.

Cell source content untouched.

Sorting logic uses raw values, not localized display strings where semantics matter.

---

# 180. Tables and theme

Hover/selection via semantic tokens.

No row-specific hardcoded background.

---

# 181. DnD and RTL

dnd-kit interactions should work independently of visual direction.

Horizontal reorder must respect logical direction if introduced.

---

# 182. Storybook acceptance matrix

Critical shared components tested matrix:

```text
dark/en
light/en
dark/ru
light/ru
```

Graph additionally:
- selected;
- conflict;
- large fixture.

---

# 183. Visual regression

Recommended after first stable design:
- Playwright screenshot or Storybook visual testing system.

At minimum capture:
- AppShell;
- Morphology;
- Data;
- Compile;
- Query;
- Landing;
- Login

in dark/light.

Do not start with brittle screenshot coverage of every pixel before UI stabilizes.

---

# 184. Feature completion definition

Feature is not done if only happy-path screenshot works.

Each feature must cover:
- loading;
- empty;
- populated;
- error;
- disabled/permission where applicable;
- light;
- dark;
- en;
- ru;
- keyboard basic path;
- mock API route;
- Storybook important state;
- test.

---

# 185. Cursor implementation order

Cursor should implement strictly in broad phases.

## Phase 1 — Workspace foundation

- monorepo;
- apps;
- packages;
- TypeScript;
- lint;
- Tailwind;
- shadcn Radix;
- design tokens;
- theme;
- i18n;
- Storybook;
- test harness.

Do not start page design before this passes.

## Phase 2 — Domain/API/mock foundation

- schemas;
- api client;
- TanStack Query;
- MSW;
- fixtures;
- auth mock;
- project mock.

## Phase 3 — App shell

- sidebar;
- project switcher;
- topbar;
- status;
- command;
- inspector;
- responsive shell.

## Phase 4 — Morphology

- graph package;
- graph view;
- objects;
- relations;
- inspector;
- evidence;
- filters;
- URL state.

## Phase 5 — Data

- table;
- add;
- processing;
- source inspector;
- states.

## Phase 6 — Compile

- current model;
- running;
- history;
- logs;
- errors.

## Phase 7 — Query

- editor;
- execution;
- results;
- evidence;
- generated code.

## Phase 8 — Overview + Settings

- overview;
- preferences;
- API keys;
- appearance/language.

## Phase 9 — Public site

- landing;
- SDK demo;
- use cases;
- responsive;
- SEO.

## Phase 10 — Try + Auth

- public demo;
- login/signup/reset.

## Phase 11 — hardening

- tests;
- accessibility;
- visual QA;
- light;
- ru;
- performance;
- bundle;
- docs.

---

# 186. Phase 1 acceptance

Must exist:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm storybook
```

Both apps render.

Theme:
- light/dark/system works.

i18n:
- en/ru works.

shadcn:
- Radix-based.

No product pages yet required.

---

# 187. Phase 2 acceptance

- MSW mode works;
- API client never knows fixture implementation;
- project/source/compile/model/query schemas exist;
- invalid fixture causes test failure;
- QueryClient configured;
- auth mock works.

---

# 188. Phase 3 acceptance

App shell:
- project route;
- persistent desktop sidebar;
- responsive off-canvas;
- topbar;
- project switch;
- global status;
- Cmd+K;
- inspector region;
- dark/light;
- en/ru.

---

# 189. Phase 4 acceptance — Morphology

Must demonstrate:
- 500-node fixture smooth enough for development;
- selected object;
- neighbour dimming;
- inspector;
- evidence;
- Objects;
- Relations;
- filters;
- theme switch without broken colors;
- locale switch without reset of selection;
- URL deep link.

Large fixture:
- does not freeze app;
- protection/aggregation/truncation state visible.

---

# 190. Phase 5 acceptance — Data

- empty;
- add;
- multiple files;
- processing;
- completion;
- fail/retry;
- filters;
- inspect source;
- delete;
- light/dark;
- en/ru.

---

# 191. Phase 6 acceptance — Compile

- no model;
- current model;
- start;
- stage progression;
- cancel;
- fail;
- complete;
- logs;
- history;
- cache invalidation;
- global status updates.

---

# 192. Phase 7 acceptance — Query

- Natural;
- Structured placeholder/real syntax boundary;
- run;
- loading;
- empty;
- error;
- object result;
- table result;
- graph result;
- evidence;
- generated Python/HTTP;
- model version.

---

# 193. Phase 8 acceptance

Overview reflects same store state.

Settings:
- theme;
- locale;
- API keys mock.

Changing theme/locale persists reload.

---

# 194. Phase 9 acceptance — Landing

- high-quality responsive;
- no gradients;
- correct design language;
- SDK demo;
- lazy graph/product visual;
- English/Russian;
- dark/light;
- SEO metadata.

---

# 195. Phase 10 acceptance — Try/Auth

Try:
- no account;
- fixed corpus;
- morphology;
- query;
- CTA.

Auth:
- forms;
- validation;
- errors;
- mock login;
- redirect.

---

# 196. Phase 11 acceptance

CI green.

No:
- untranslated visible product strings;
- raw brand HEX in feature components;
- Base UI imports;
- manual generic modal/dropdown focus logic;
- TypeScript any leaks;
- direct mock fixture imports from UI.

---

# 197. Forbidden implementation patterns

Cursor must not:

1. build one giant client-only app;
2. use Base UI;
3. mix Radix/Base primitives;
4. create custom modal instead of Radix Dialog;
5. fetch inside arbitrary JSX;
6. store server state in Zustand;
7. import fixture arrays into pages;
8. hardcode English strings;
9. hardcode dark colors;
10. use physical left/right spacing when logical direction is appropriate;
11. render Morphology with React Flow by default;
12. implement Query as chat;
13. add gradients;
14. add glass;
15. add random dependencies;
16. generate fake percentages;
17. add `Runs` sidebar;
18. create unsupported fake features;
19. use production-insecure auth storage based on mock assumptions;
20. ignore loading/error/empty states.

---

# 198. Required Cursor self-check before completion

Cursor should produce a checklist report:

```text
[ ] pnpm install clean
[ ] typecheck clean
[ ] lint clean
[ ] unit tests clean
[ ] Storybook build clean
[ ] site build clean
[ ] app build clean
[ ] Playwright smoke clean

[ ] Radix base confirmed
[ ] no Base UI dependency/imports
[ ] theme light/dark/system works
[ ] en/ru works
[ ] RTL logical CSS baseline followed
[ ] MSW isolated
[ ] no direct fixtures in UI
[ ] no raw API fetch in pages/components
[ ] no server state in Zustand
[ ] no raw brand HEX in feature components
[ ] no gradients
```

---

# 199. Recommended package-level scripts

Root:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "storybook": "turbo storybook",
    "test:e2e": "playwright test"
  }
}
```

Exact syntax may adapt to generated workspace.

---

# 200. Environment modes

At minimum:

```text
development
test
production
```

Plus app semantic flag:

```text
mock mode
```

Do not create 12 environments in frontend code.

---

# 201. Production API switch

Switch from mock to real backend should ideally be:

```text
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_BASE_URL=https://...
```

plus auth adapter config.

Feature components unchanged.

If replacing mocks requires rewriting screens, architecture failed.

---

# 202. Backend contract evolution

When OpenAPI becomes stable:

Possible future:
- generate low-level types/client;
- keep high-level api-client facade.

Do not couple feature components directly to generated client.

This keeps backend codegen replaceable.

---

# 203. API versioning

Client base should tolerate:

```text
/v1
```

Endpoint version belongs transport/config, not duplicated manually.

---

# 204. Request cancellation

Search/filter:
- AbortSignal from TanStack Query;
- stale request cancelled.

Graph/object search especially.

Do not let old responses overwrite new query context.

---

# 205. Optimistic updates

Use only when semantics safe.

Good candidates:
- local preference;
- non-critical UI setting.

Avoid blindly optimistic:
- compile;
- delete source;
- model-changing operations.

---

# 206. Destructive mutation cache behavior

After delete:
- invalidate relevant lists;
- clear selected entity;
- navigate if current object deleted;
- toast result.

Confirmation via Radix AlertDialog.

---

# 207. Accessibility of async status

Important process completion/failure may use:
- toast;
- aria-live region.

Avoid screen reader spam during percent updates.

---

# 208. Project health derivation

Prefer backend health summary eventually.

Mock frontend may derive from mock state.

Do not encode complex business health rules permanently in UI if backend should own them.

---

# 209. Overview charts data

API client exposes prepared series DTO.

UI does not scan 10k objects client-side just to make overview chart unless intentionally local.

---

# 210. Design consistency enforcement

Storybook + shared UI is primary.

Do not let each feature restyle:
- button;
- badge;
- input;
- table header;
- tabs.

Feature-specific visual variation requires explicit variant.

---

# 211. Locale and theme in tests

Every new product component PR should at least be manually/story checked:
- dark English;
- light English;
- Russian long string.

Critical layout:
- automated.

---

# 212. Documentation artifacts in repo

Copy into repository root or `/docs`:

```text
docs/
├── ELMORF_DESIGN_SYSTEM.md
└── ELMORF_FRONTEND_SPEC.md
```

Cursor should read both before large UI changes.

Optional:
```text
AGENTS.md
```

with short pointer:
> UI work must follow these docs.

---

# 213. AGENTS.md recommendation

Because coding agents will be used, create concise root `AGENTS.md`.

It should include:
- build/test commands;
- required docs;
- Radix mandatory;
- no Base UI;
- no hardcoded copy/colors;
- architecture boundaries;
- mock rule.

Do not copy entire 200-section spec into AGENTS.md.

---

# 214. Visual development workflow

Recommended:

```text
1. implement primitive
2. Storybook
3. feature composition
4. page state
5. Playwright
6. visual review
```

Not:

```text
build whole app
→ discover design inconsistencies at end
```

---

# 215. First real visual checkpoint

Before continuing beyond Morphology, produce screenshot/story states:

```text
AppShell dark
AppShell light

Morphology graph dark
Morphology graph light

Object inspector
Objects table
Relations table

English
Russian
```

Review against Design System.

---

# 216. Second visual checkpoint

After Data/Compile/Query:
- verify same component language;
- no feature invented custom form/table/status styles.

---

# 217. Public visual checkpoint

Landing should reuse:
- tokens;
- graph semantics;
- code surfaces;
- typography.

It may use larger spacing/type but not a different brand universe.

---

# 218. Theme semantic rule

Theme never changes meaning.

Example:
- brass remains primary/selection;
- warning remains warning;
- destructive remains red.

Only luminance/surface values adapt.

Do not make selected blue in light and brass in dark.

---

# 219. High contrast future

Not required now.

But because semantic tokens exist, future high-contrast theme should be possible without feature refactor.

---

# 220. Language expansion future

Future likely locales may have:
- longer Latin strings;
- RTL;
- CJK.

UI should avoid fixed text widths that only fit English.

Tables may truncate with tooltip where appropriate.

Buttons should expand within reasonable constraints.

---

# 221. Translation workflow future

No translation SaaS required initially.

Message files in git.

Later:
- Lokalise/Phrase/etc can integrate without changing runtime i18n architecture.

---

# 222. User preference schema

Frontend domain candidate:

```ts
const UserPreferencesSchema = z.object({
  locale: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional()
});
```

Later add:
- timezone;
- density;
- graph preferences.

Do not overfill now.

---

# 223. Settings persistence mock

Mock backend:
- update preference endpoint.

Also local immediate application.

This exercises future real mutation path.

---

# 224. Cross-domain preference

`elmorf.com` and `app.elmorf.com` are separate apps.

Do not rely on localStorage being shared.

Anonymous public theme/locale:
- local to site.

Authenticated app:
- account preference eventually provides cross-device consistency.

Cross-domain cookie sync is not required in v1 unless product specifically wants it.

---

# 225. Public login links and locale

From localized site:
- link to app login can optionally include locale hint:

```text
https://app.elmorf.com/login?locale=ru
```

App validates locale and stores preference/cookie.

Do not force locale prefix into app routes.

---

# 226. Post-auth locale

If account has stored locale:
- account wins over incoming hint.

If no account locale:
- incoming hint/browser chosen.

---

# 227. Theme from public to auth

No strict cross-domain carry required.

If desired later:
- query hint;
- account preference;
- domain cookie.

Not foundation-critical.

---

# 228. Source of truth summary

```text
Visual contract
→ ELMORF_DESIGN_SYSTEM.md

Technical contract
→ ELMORF_FRONTEND_SPEC.md

API server data
→ TanStack Query

Client workspace state
→ Zustand

Shareable state
→ URL

Forms
→ RHF + Zod

UI primitives
→ shadcn + Radix

Theme
→ semantic tokens + next-themes

i18n
→ next-intl

Mock backend
→ MSW

Morphology model
→ Graphology

Morphology renderer
→ Sigma
```

---

# 229. Definition of successful first frontend

The first frontend is successful if a user can:

1. open `elmorf.com`;
2. understand what Elmorf is;
3. see the SDK mental model;
4. open `/try`;
5. explore a prepared model;
6. create/login to mock account;
7. create a project;
8. add mock sources;
9. watch processing;
10. compile;
11. inspect Graph/Objects/Relations;
12. inspect evidence;
13. run Query;
14. view generated API/SDK code;
15. switch dark/light/system;
16. switch English/Russian;
17. reload without UX falling apart.

And a developer can then switch MSW off and begin connecting real endpoints without rebuilding the frontend architecture.

---

# 230. Final implementation mandate for Cursor

Cursor should treat this specification as an implementation contract.

Do not stop after generating page skeletons.

Do not report completion while:
- states are absent;
- theme only partly works;
- Russian breaks layout;
- mock data bypasses HTTP;
- graph is placeholder boxes;
- forms are not validated;
- Storybook is missing;
- builds/tests fail.

At the end, provide:

1. implementation summary;
2. repository tree;
3. commands;
4. dependency list;
5. known deferred items;
6. test results;
7. screenshots or Storybook routes if available;
8. explicit checklist against Sections 186–196.

---

# 231. Technology verification notes — 2026-09-25

These choices were checked against current upstream documentation before this specification was written:

- Next.js 16 is the current Active LTS line; use the newest security patch available at implementation time.
- shadcn currently defaults new projects to Base UI, **but Radix remains fully supported** and can be selected explicitly with `-b radix`. Elmorf explicitly requires Radix.
- shadcn theming is based on semantic CSS background/foreground variables and supports `next-themes` for Next.js dark/light/system behavior.
- shadcn exposes an RTL migration and logical-direction support; Elmorf should use this foundation even though initial locales are LTR.
- Next.js App Router supports internationalized routing patterns.
- `next-intl` supports Server Components, Client Components, ICU messages, typed message usage, localized routing, and date/number formatting.
- Storybook recommends `@storybook/nextjs-vite` for most Next.js projects.
- TanStack Query continues to center queries, mutations, invalidation and typed `queryOptions`.

Primary upstream references:
- `https://nextjs.org/docs`
- `https://ui.shadcn.com/docs`
- `https://next-intl.dev`
- `https://tanstack.com/query/latest`
- `https://tanstack.com/table/latest`
- `https://tanstack.com/virtual/latest`
- `https://storybook.js.org/docs`
- `https://www.sigmajs.org`
- `https://graphology.github.io`

---

# 232. Final note

This frontend should be engineered so that future changes are cheap in the dimensions we already know will change:

```text
backend implementation
number of projects
number of objects
theme
locale
graph scale
auth provider
telemetry vendor
API contract generation
```

And intentionally rigid where the product identity is already known:

```text
Elmorf terminology
Graphite + Brass identity
shadcn + Radix foundation
Data → Compile → Morphology → Query mental model
evidence-first inspection
Query as workbench
no AI-slop visual language
```

The goal is not to predict every future feature.

The goal is to make the **known axes of change explicit now**, so the frontend can evolve without being rewritten.
