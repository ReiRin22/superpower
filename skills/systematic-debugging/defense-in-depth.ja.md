# Defense-in-Depth Validation

## 概要

invalid data が原因のバグを直す時、一箇所に validation を追加すれば十分に感じる。しかしその単一チェックは、別の code path、refactoring、mock によって迂回されることがある。

**中核原則:** データが通るすべてのレイヤーで validate する。バグを構造的に不可能にする。

## なぜ複数レイヤーか

単一 validation: 「バグを直した」  
複数レイヤー: 「バグを不可能にした」

異なるレイヤーは異なるケースを捕まえる。

- entry validation は大半のバグを捕まえる
- business logic は edge case を捕まえる
- environment guards は文脈固有の危険を防ぐ
- debug logging は他レイヤーが失敗した時に役立つ

## 4 つのレイヤー

### Layer 1: Entry Point Validation

**目的:** API boundary で明らかに invalid な input を拒否する。

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory cannot be empty');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory does not exist: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory is not a directory: ${workingDirectory}`);
  }
}
```

### Layer 2: Business Logic Validation

**目的:** その操作にとってデータが意味をなすことを保証する。

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('projectDir required for workspace initialization');
  }
}
```

### Layer 3: Environment Guards

**目的:** 特定文脈で危険な操作を防ぐ。

```typescript
async function gitInit(directory: string) {
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${directory}`
      );
    }
  }
}
```

### Layer 4: Debug Instrumentation

**目的:** forensic 用の文脈を記録する。

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('About to git init', {
    directory,
    cwd: process.cwd(),
    stack,
  });
}
```

## パターンの適用

バグを見つけたら:

1. **データフローを辿る** - 悪い値はどこで発生し、どこで使われるか
2. **checkpoint を map する** - データが通るすべての点を列挙する
3. **各レイヤーに validation を追加する** - entry, business, environment, debug
4. **各レイヤーをテストする** - Layer 1 を迂回して、Layer 2 が捕まえるか確認する

## セッション例

Bug: 空の `projectDir` により source code 内で `git init` が走った

**Data flow:**

1. Test setup -> empty string
2. `Project.create(name, '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` が `process.cwd()` で実行

**追加した 4 層:**

- Layer 1: `Project.create()` が empty/exists/writable を validate
- Layer 2: `WorkspaceManager` が projectDir が空でないことを validate
- Layer 3: `WorktreeManager` が test 中 tmpdir 外の git init を拒否
- Layer 4: git init 前の stack trace logging

**結果:** 1847 tests passed、バグ再現不能。

## 重要 insight

4 層すべてが必要だった。テスト中、各レイヤーは他が見逃したバグを捕まえた。

- 別 code path が entry validation を迂回した
- mocks が business logic checks を迂回した
- platform ごとの edge case に environment guards が必要だった
- debug logging が構造的 misuse を特定した

**一つの validation point で止めない。** 各レイヤーに check を追加する。
