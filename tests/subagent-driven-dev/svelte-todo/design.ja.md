# Svelte Todo List - 設計

## 概要

Svelte で作る simple todo list application。todo の作成、完了、削除をサポートし、localStorage に永続化する。

## Features

- new todos を追加
- todos を complete/incomplete に切り替え
- todos を削除
- All / Active / Completed で filter
- completed todos をまとめて clear
- localStorage に persist
- remaining items count を表示

## User Interface

```text
Svelte Todos
[________________________] [Add]
[ ] Buy groceries                  [x]
[x] Walk the dog                   [x]
[ ] Write code                     [x]
2 items left
[All] [Active] [Completed] [Clear completed]
```

## Components

```text
src/
  App.svelte           # main app, state management
  lib/
    TodoInput.svelte   # text input + Add button
    TodoList.svelte    # list container
    TodoItem.svelte    # single todo with checkbox, text, delete
    FilterBar.svelte   # filter buttons + clear completed
    store.ts           # Svelte store for todos
    storage.ts         # localStorage persistence
```

## Data Model

```typescript
interface Todo {
  id: string;        // UUID
  text: string;      // Todo text
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';
```

## Acceptance Criteria

1. typing して Enter または Add click で todo を追加できる
2. checkbox click で todo completion を toggle できる
3. X button click で todo を削除できる
4. filter buttons が correct subset of todos を表示する
5. "X items left" が incomplete todos count を表示する
6. "Clear completed" が completed todos をすべて削除する
7. page refresh 後も todos が残る (localStorage)
8. empty state が helpful message を表示する
9. all tests pass
