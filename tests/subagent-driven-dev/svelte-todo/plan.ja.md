# Svelte Todo List - 実装計画

この計画は `superpowers:subagent-driven-development` skill を使って実行する。

## Context

Svelte で todo list app を作る。完全な specification は `design.md` を参照。

## Tasks

### Task 1: Project Setup

Vite で Svelte project を作る。

**Do:**

- `npm create vite@latest . -- --template svelte-ts` を実行
- `npm install` で dependencies を install
- dev server が動くことを verify
- App.svelte から default Vite template content を削除

**Verify:**

- `npm run dev` starts server
- App が minimal "Svelte Todos" heading を表示
- `npm run build` succeeds

---

### Task 2: Todo Store

todo state management 用 Svelte store を作る。

**Do:**

- `src/lib/store.ts` を作成
- id, text, completed を持つ `Todo` interface を定義
- initial empty array の writable store を作成
- functions を export: `addTodo(text)`, `toggleTodo(id)`, `deleteTodo(id)`, `clearCompleted()`
- 各 function の tests を `src/lib/store.test.ts` に追加

**Verify:**

- tests pass: `npm run test` (必要なら vitest install)

---

### Task 3: localStorage Persistence

todos の persistence layer を追加する。

**Do:**

- `src/lib/storage.ts` を作成
- `loadTodos(): Todo[]` と `saveTodos(todos: Todo[])` を実装
- JSON parse errors を graceful に扱う (empty array を返す)
- store と統合: init 時 load、change 時 save
- load/save/error handling の tests を追加

**Verify:**

- tests pass
- manual test: todo を追加し refresh 後も残る

---

### Task 4: TodoInput Component

todo 追加用 input component を作る。

**Do:**

- `src/lib/TodoInput.svelte` を作成
- text input を local state に bind
- Add button が `addTodo()` を呼び input を clear
- Enter key でも submit
- input empty の時 Add button を disable
- component tests を追加

**Verify:**

- tests pass
- component が input と button を render

---

### Task 5: TodoItem Component

single todo item component を作る。

**Do:**

- `src/lib/TodoItem.svelte` を作成
- Props: `todo: Todo`
- checkbox が completion を toggle (`toggleTodo`)
- completed 時 text に strikethrough
- Delete button (X) が `deleteTodo` を呼ぶ
- component tests を追加

**Verify:**

- tests pass
- checkbox, text, delete button が render

---

### Task 6: TodoList Component

list container component を作る。

**Do:**

- `src/lib/TodoList.svelte` を作成
- Props: `todos: Todo[]`
- each todo に TodoItem を render
- empty 時 "No todos yet" を表示
- component tests を追加

**Verify:**

- tests pass
- TodoItems の list が render

---

### Task 7: FilterBar Component

filter and status bar component を作る。

**Do:**

- `src/lib/FilterBar.svelte` を作成
- Props: `todos: Todo[]`, `filter: Filter`, `onFilterChange: (f: Filter) => void`
- count を表示: "X items left"
- filter buttons: All, Active, Completed
- active filter を visually highlighted
- "Clear completed" button (completed todos がない時 hidden)
- component tests を追加

**Verify:**

- tests pass
- count, filters, clear button が render

---

### Task 8: App Integration

App.svelte で全 components を接続する。

**Do:**

- all components and store を import
- filter state を追加 (default: 'all')
- filter state に基づき filtered todos を compute
- heading, TodoInput, TodoList, FilterBar を render
- appropriate props を各 component に渡す

**Verify:**

- App renders all components
- adding/toggling/deleting works

---

### Task 9: Filter Functionality

filtering が end-to-end で動くことを保証する。

**Do:**

- filter buttons が displayed todos を変えることを verify
- `all` は all todos
- `active` は incomplete only
- `completed` は completed only
- Clear completed が completed todos を削除し、必要なら filter を reset
- integration tests を追加

**Verify:**

- filter tests pass
- all filter states を manual verification

---

### Task 10: Styling and Polish

usability 用 CSS styling を追加する。

**Do:**

- design mockup に合わせて style
- completed todos は strikethrough と muted color
- active filter button を highlighted
- input に focus styles
- delete button は hover 時表示、mobile では常時表示
- responsive layout

**Verify:**

- App is visually usable
- styles don't break functionality

---

### Task 11: End-to-End Tests

full user flows の Playwright tests を追加する。

**Do:**

- `npm init playwright@latest` を install
- `tests/todo.spec.ts` を作成
- test flows:
  - add a todo
  - complete a todo
  - delete a todo
  - filter todos
  - clear completed
  - persistence (add, reload, verify)

**Verify:**

- `npx playwright test` passes

---

### Task 12: README

project を文書化する。

**Do:**

- `README.md` を作成
  - project description
  - setup: `npm install`
  - development: `npm run dev`
  - testing: `npm test` and `npx playwright test`
  - build: `npm run build`

**Verify:**

- README が project を正確に説明する
- instructions work
