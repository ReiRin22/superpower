# テストのアンチパターン

**読み込むタイミング:** テストを書いている/変更している、mock を追加している、production code に test-only method を追加したくなった時。

## 概要

テストは mock behavior ではなく real behavior を検証しなければならない。mock は分離の手段であり、テスト対象ではない。

**中核原則:** mock が何をするかではなく、コードが何をするかをテストする。

**厳格な TDD に従うと、これらのアンチパターンを防げる。**

## 鉄則

```text
1. mock behavior をテストしてはならない
2. production class に test-only method を追加してはならない
3. 依存関係を理解せず mock してはならない
```

## Anti-Pattern 1: Mock Behavior をテストする

**違反:**

```typescript
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**なぜ間違いか:**

- component ではなく mock が動くことを検証している
- mock があると通り、ないと失敗する
- real behavior について何も教えない

**human partner の修正:** "Are we testing the behavior of a mock?"

**修正:**

```typescript
test('renders sidebar', () => {
  render(<Page />);  // sidebar を mock しない
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### Gate Function

```text
mock element に assert する前に:
  "real component behavior をテストしているか、mock の存在だけか?" と尋ねる

  mock の存在をテストしているなら:
    停止 - assertion を削除するか component を unmock する

  real behavior をテストする
```

## Anti-Pattern 2: Production の Test-Only Methods

**違反:**

```typescript
class Session {
  async destroy() {  // production API に見えるが test only
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}

afterEach(() => session.destroy());
```

**なぜ間違いか:**

- production class が test-only code で汚染される
- 本番で誤って呼ばれると危険
- YAGNI と separation of concerns に反する
- object lifecycle と entity lifecycle を混同する

**修正:**

```typescript
// test-utils/
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}

afterEach(() => cleanupSession(session));
```

### Gate Function

```text
production class に method を追加する前に:
  "これは test だけで使われるか?" と尋ねる

  yes なら:
    停止 - 追加しない
    test utilities に置く

  "この class はこの resource の lifecycle を所有しているか?" と尋ねる

  no なら:
    停止 - この method を置く class が間違っている
```

## Anti-Pattern 3: 理解せず Mock する

**違反:**

```typescript
test('detects duplicate server', () => {
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);  // throw すべきだが、しない
});
```

**なぜ間違いか:**

- mock した method に、test が依存する side effect があった
- 「安全のため」の over-mocking が実挙動を壊す
- テストが間違った理由で通る/不可解に失敗する

**修正:**

```typescript
test('detects duplicate server', () => {
  vi.mock('MCPServerManager'); // 遅い server startup だけ mock

  await addServer(config);  // Config written
  await addServer(config);  // Duplicate detected
});
```

### Gate Function

```text
method を mock する前に:
  停止 - まだ mock しない

  1. real method にはどんな side effects があるか?
  2. この test はその side effects に依存しているか?
  3. この test が何を必要とするか完全に理解しているか?

  side effects に依存するなら:
    より低い level を mock する
    または必要 behavior を保つ test double を使う

  不確かなら:
    まず real implementation で test を走らせる
    実際に何が必要か観察する
    その後、正しい level で最小限に mock する
```

## Anti-Pattern 4: 不完全な Mock

**違反:**

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // downstream code が使う metadata がない
};
```

**なぜ間違いか:**

- partial mocks は structural assumptions を隠す
- downstream code が含めなかった field に依存する可能性がある
- test は通るが integration は失敗する
- real behavior について誤った自信を与える

**鉄則:** 直近の test が使う field だけではなく、現実に存在する完全な data structure を mock する。

**修正:**

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
};
```

## Anti-Pattern 5: Integration Tests を後回しにする

**違反:**

```text
Implementation complete
No tests written
"Ready for testing"
```

**なぜ間違いか:**

- testing は implementation の一部であり、任意の follow-up ではない
- TDD ならこれを捕まえる
- test なしに complete と主張できない

**修正:**

```text
TDD cycle:
1. Write failing test
2. Implement to pass
3. Refactor
4. THEN claim complete
```

## Mock が複雑になりすぎる時

**warning signs:**

- mock setup が test logic より長い
- test を通すために何でも mock している
- real components にある method が mock にない
- mock 変更で test が壊れる

**human partner の質問:** "Do we need to be using a mock here?"

**検討:** real components を使う integration test の方が complex mocks より単純なことが多い。

## TDD はこれらを防ぐ

**なぜ TDD が役立つか:**

1. **先に test を書く** - 何をテストしているか考える
2. **失敗を見る** - mock ではなく real behavior をテストしていると確認する
3. **最小実装** - test-only methods が紛れ込まない
4. **real dependencies** - mock 前に test が何を必要とするか分かる

mock behavior をテストしているなら TDD に違反している。real code に対して test failure を見ずに mock を追加したからである。

## クイックリファレンス

| Anti-Pattern | Fix |
|--------------|-----|
| mock elements に assert | real component を test する、または unmock |
| production の test-only methods | test utilities へ移す |
| 理解なしに mock | 先に dependencies を理解し、最小限に mock |
| 不完全 mocks | real API を完全に mirror |
| tests as afterthought | TDD - tests first |
| over-complex mocks | integration tests を検討 |

## Red Flags

- `*-mock` test IDs を確認する assertion
- test files からしか呼ばれない methods
- mock setup が test の 50% 超
- mock を外すと test が失敗する
- なぜ mock が必要か説明できない
- 「安全のため」mock している

## 結論

**Mocks は分離のための道具であり、テスト対象ではない。**

TDD が mock behavior をテストしていることを明らかにしたなら、進め方を間違えている。

修正: real behavior をテストするか、そもそも mock が必要か疑う。
