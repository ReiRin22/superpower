---
name: writing-plans
description: 複数ステップのタスクについて仕様や要件があり、コードに触れる前に使う
---

# 実装計画を書く

## 概要

コードベースへの文脈がゼロで、判断の好みも怪しいエンジニアに渡す前提で、包括的な実装計画を書く。各タスクで触るファイル、コード、テスト、確認すべきドキュメント、テスト方法など、必要なものをすべて書く。小さなタスクに分ける。DRY、YAGNI、TDD、頻繁なコミット。

相手は熟練開発者だが、こちらのツールセットや問題領域についてはほとんど知らないと仮定する。良いテスト設計にも詳しくないと仮定する。

**開始時に宣言:** "I'm using the writing-plans skill to create the implementation plan."

**文脈:** 分離された worktree で作業する場合、実行時に `superpowers:using-git-worktrees` スキルで作成済みであるべき。

**計画の保存先:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- ユーザーの保存場所指定があれば、それを優先する

## スコープ確認

仕様が複数の独立サブシステムを含む場合、brainstorming 中にサブプロジェクト仕様へ分割されているべきである。そうでなければ、サブシステムごとに別計画へ分けることを提案する。各計画は単独で動作し、テスト可能なソフトウェアを生むべきである。

## ファイル構造

タスクを定義する前に、どのファイルを作成または変更し、それぞれが何を担当するかを整理する。ここで分解方針を固定する。

- 明確な境界と定義済みインターフェースを持つ単位を設計する。各ファイルは一つの明確な責務を持つべき。
- 一度に文脈に保持できるコードほど推論しやすく、ファイルが集中しているほど編集の信頼性が高い。大きすぎるファイルより、小さく焦点の合ったファイルを好む。
- 一緒に変わるファイルは近くに置く。技術レイヤーではなく責務で分割する。
- 既存コードベースでは既存パターンに従う。大きなファイルを使うコードベースを一方的に再構成しない。ただし変更対象ファイルが扱いにくいほど大きい場合は、分割を計画に含めるのは妥当。

この構造がタスク分解を決める。各タスクは、それ単独で意味のある自己完結した変更を生むべきである。

## 小さなタスク粒度

**各ステップは一つの行動 (2-5 分):**
- 「失敗するテストを書く」 - ステップ
- 「失敗することを確認するため実行する」 - ステップ
- 「テストを通す最小実装を書く」 - ステップ
- 「テストを実行して通ることを確認する」 - ステップ
- 「コミットする」 - ステップ

## 計画ドキュメントのヘッダー

**すべての計画は必ずこのヘッダーで始める:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## タスク構造

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## プレースホルダー禁止

各ステップには、エンジニアに必要な実内容を入れる。以下は**計画の失敗**であり、絶対に書かない。

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (実際のテストコードなし)
- "Similar to Task N" (コードを繰り返す。エンジニアはタスクを順不同で読むかもしれない)
- 何をするかだけを書き、どうするかを示さないステップ (コード変更ステップにはコードブロック必須)
- どのタスクでも定義されていない型、関数、メソッドへの参照

## 忘れないこと

- 正確なファイルパスを常に書く
- 各ステップに完全なコードを書く。ステップがコードを変えるなら、そのコードを示す
- 正確なコマンドと期待出力を書く
- DRY、YAGNI、TDD、頻繁なコミット

## 自己レビュー

完全な計画を書いたら、新しい目で仕様を見直し、計画と照合する。これは自分で実行するチェックリストであり、サブエージェント委任ではない。

**1. 仕様カバレッジ:** 仕様の各セクション/要件をざっと確認する。それを実装するタスクを指せるか。不足を列挙する。

**2. プレースホルダー確認:** 「プレースホルダー禁止」セクションの危険パターンを計画から探す。見つけたら直す。

**3. 型の一貫性:** 後続タスクで使う型、メソッドシグネチャ、プロパティ名は、前のタスクで定義したものと一致しているか。Task 3 で `clearLayers()`、Task 7 で `clearFullLayers()` と呼ぶのはバグである。

問題が見つかったらその場で修正する。再レビューは不要で、直して進む。仕様要件に対応タスクがなければ、タスクを追加する。

## 実行への引き継ぎ

計画を保存したら、実行方法を選んでもらう。

**"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?"**

**Subagent-Driven が選ばれた場合:**
- **REQUIRED SUB-SKILL:** superpowers:subagent-driven-development を使う
- タスクごとに新しいサブエージェント + 二段階レビュー

**Inline Execution が選ばれた場合:**
- **REQUIRED SUB-SKILL:** superpowers:executing-plans を使う
- チェックポイント付きのバッチ実行
