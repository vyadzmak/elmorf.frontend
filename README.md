# Elmorf frontend

Монорепозиторий frontend Elmorf. Реального API нет: браузер ходит обычным HTTP, а в mock-режиме ответы отдаёт in-memory store.

Визуальный контракт: `docs/ELMORF_DESIGN_SYSTEM.md`.
Технический контракт: `docs/ELMORF_FRONTEND_SPEC.md`.

## Структура

```text
apps/site          elmorf.com, локаль в URL
apps/app           app.elmorf.com, локаль без префикса в URL
packages/ui        токены, тема, shadcn/Radix
packages/i18n      локали, направление, общие сообщения
packages/config    TypeScript и разбор env
packages/domain    Zod-схемы домена
packages/api-client HTTP-клиент и TanStack Query
packages/graph
packages/mocks     MSW, фикстуры, сценарии
packages/test-utils
```

## Требования

- Node.js `20.19+` или `22.12+`. Версия `22.5` не подходит: Vite и Storybook требуют `22.12`.
- pnpm 10.15.1

Если стоит nvm: `nvm use`.

## Команды

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm storybook
```

`pnpm dev` поднимает сайт на [http://localhost:3001](http://localhost:3001) и приложение на [http://localhost:3002](http://localhost:3002). Storybook слушает порт 6006. `pnpm e2e` гоняет смоук Playwright по уже запущенным серверам локально и поднимает их сам в CI.

## Тема

Light, dark и system работают с первого дня. По умолчанию `system`. Dark остаётся каноническим визуальным reference. Переключатель есть на фундаментном экране обоих приложений. Предпочтение хранится локально через `next-themes`.

`next-themes` 0.4.6 рисует блокирующий script из client-компонента. React 19 при клиентской навигации считает это ошибкой. Патч `patches/next-themes@0.4.6.patch` оставляет script только в серверном HTML: класс темы ставится до отрисовки, а повторный рендер на клиенте script не создаёт.

## Локали

Поддерживаются `en` и `ru`.

Сайт: английский без префикса (`/`), русский как `/ru`. Язык определяется URL, без редиректа по `Accept-Language`.

Приложение: язык в URL не входит. Сначала cookie `ELMORF_LOCALE`, затем `Accept-Language`, затем `en`.

## Mock mode

`NEXT_PUBLIC_MOCK_MODE=true` по умолчанию. Пример переменных: `apps/site/.env.example` и `apps/app/.env.example`. Некорректное значение окружения останавливает приложение.

В mock-режиме приложение регистрирует MSW до запросов. Клиент не импортирует фикстуры. Демо-проект — Vendor Contracts, пользователь Ada Lang. Сценарии store: happy, empty, processing, compile-running, compile-failed, partial, conflicts, large-graph, api-error, permission-limited, slow-network.

## shadcn

База — Radix, стиль CLI — `radix-nova`, RTL включён. Это текущий компактный Radix-пресет shadcn. Компоненты ставятся в `packages/ui`.

Из каталога приложения:

```bash
pnpm dlx shadcn@latest add button --cwd apps/site
```

Новый компонент должен получить story в Storybook. Поведение Radix не переписывается.

## Переводы

1. Канонический ключ добавляется в английский JSON.
2. Тот же ключ добавляется в русский JSON.
3. Для чисел и грамматики используется ICU.
4. В компоненте нет захардкоженной пользовательской строки.

Общие строки фундамента лежат в `packages/i18n/messages`.
