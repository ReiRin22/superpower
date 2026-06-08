---
name: finishing-a-development-branch
description: 実装が完了し、全テストが通り、作業の統合方法を決める必要がある時に使う。マージ、PR、クリーンアップの構造化された選択肢を提示して開発作業の完了を導く
---

# 開発ブランチを仕上げる

## 概要

明確な選択肢を提示し、選ばれたワークフローを処理して、開発作業の完了を導く。

**中核原則:** テストを検証する -> 環境を検出する -> 選択肢を提示する -> 選択を実行する -> 後片付けする。

**開始時に宣言:** "I'm using the finishing-a-development-branch skill to complete this work."

## プロセス

### Step 1: テストを検証する

**選択肢を提示する前に、テストが通ることを検証する:**

```bash
# プロジェクトのテストスイートを実行する
npm test / cargo test / pytest / go test ./...
```

**テストが失敗した場合:**

```text
Tests failing (<N> failures). Must fix before completing:

[失敗内容を示す]

Cannot proceed with merge/PR until tests pass.
```

停止する。Step 2 へ進まない。

**テストが通った場合:** Step 2 へ進む。

### Step 2: 環境を検出する

**選択肢を提示する前に、ワークスペース状態を判断する:**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

これにより表示するメニューとクリーンアップ方法が決まる。

| 状態 | メニュー | クリーンアップ |
|------|----------|----------------|
| `GIT_DIR == GIT_COMMON` (通常 repo) | 標準 4 選択肢 | worktree cleanup なし |
| `GIT_DIR != GIT_COMMON`, 名前付きブランチ | 標準 4 選択肢 | provenance-based (Step 6 参照) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | 縮小 3 選択肢 (merge なし) | cleanup なし (外部管理) |

### Step 3: ベースブランチを決める

```bash
# よくあるベースブランチを試す
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

または尋ねる: "This branch split from main - is that correct?"

### Step 4: 選択肢を提示する

**通常 repo と名前付きブランチ worktree - 正確にこの 4 選択肢を提示する:**

```text
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Detached HEAD - 正確にこの 3 選択肢を提示する:**

```text
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**説明を追加しない** - 選択肢は簡潔に保つ。

### Step 5: 選択を実行する

#### Option 1: ローカルでマージ

```bash
# CWD 安全のため main repo root を取得する
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先にマージする - 何かを削除する前に成功を検証する
git checkout <base-branch>
git pull
git merge <feature-branch>

# マージ結果でテストを検証する
<test command>

# マージ成功後だけ: worktree cleanup (Step 6)、その後ブランチ削除
```

その後、worktree cleanup (Step 6) を実行し、ブランチを削除する。

```bash
git branch -d <feature-branch>
```

#### Option 2: Push して PR 作成

```bash
# ブランチを push
git push -u origin <feature-branch>

# PR 作成
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

**worktree を cleanup してはならない** - ユーザーは PR フィードバック対応のため生かしておく必要がある。

#### Option 3: そのまま保持

報告: "Keeping branch <name>. Worktree preserved at <path>."

**worktree を cleanup しない。**

#### Option 4: 破棄

**先に確認する:**

```text
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

正確な確認を待つ。

確認されたら:

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

その後、worktree cleanup (Step 6) を実行し、ブランチを強制削除する。

```bash
git branch -D <feature-branch>
```

### Step 6: ワークスペースを cleanup する

**Options 1 と 4 の場合だけ実行する。** Options 2 と 3 は常に worktree を保持する。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**`GIT_DIR == GIT_COMMON` の場合:** 通常 repo。cleanup すべき worktree はない。完了。

**worktree path が `.worktrees/`、`worktrees/`、または `~/.config/superpowers/worktrees/` 配下の場合:** Superpowers が作成した worktree なので cleanup してよい。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # 自己修復: 古い登録を掃除する
```

**それ以外:** ホスト環境 (harness) がこのワークスペースを所有している。削除してはならない。プラットフォームに workspace-exit ツールがあれば使う。なければワークスペースを残す。

## クイックリファレンス

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | yes | - | - | yes |
| 2. Create PR | - | yes | yes | - |
| 3. Keep as-is | - | - | yes | - |
| 4. Discard | - | - | - | yes (force) |

## よくある間違い

**テスト検証を飛ばす**
- **問題:** 壊れたコードをマージしたり、失敗 PR を作ったりする
- **修正:** 選択肢を提示する前に必ずテストを検証する

**自由回答の質問**
- **問題:** "次に何をしますか?" は曖昧
- **修正:** 正確に 4 つの構造化選択肢を出す (detached HEAD なら 3 つ)

**Option 2 で worktree を cleanup する**
- **問題:** PR 反復に必要な worktree を削除してしまう
- **修正:** cleanup は Options 1 と 4 のみ

**worktree 削除前にブランチを削除する**
- **問題:** worktree がブランチを参照しているため `git branch -d` が失敗する
- **修正:** 先にマージ、worktree 削除、その後ブランチ削除

**削除対象 worktree 内から `git worktree remove` を実行する**
- **問題:** コマンドが失敗する
- **修正:** worktree remove 前に必ず main repo root へ `cd` する

**harness 管理の worktree を cleanup する**
- **問題:** harness が作った worktree を削除すると phantom state が生じる
- **修正:** `.worktrees/`、`worktrees/`、`~/.config/superpowers/worktrees/` 配下だけ cleanup する

**破棄の確認なし**
- **問題:** 誤って作業を削除する
- **修正:** typed "discard" confirmation を要求する

## 危険信号

**絶対にしない:**

- テスト失敗のまま進む
- 結果テストを検証せずマージする
- 確認なしに作業を削除する
- 明示依頼なしに force-push する
- マージ成功確認前に worktree を削除する
- 自分が作っていない worktree を cleanup する
- worktree 内から `git worktree remove` を実行する

**常にする:**

- 選択肢提示前にテストを検証する
- メニュー提示前に環境を検出する
- 正確に 4 選択肢を提示する (detached HEAD なら 3)
- Option 4 では typed confirmation を得る
- worktree cleanup は Options 1 と 4 のみ
- worktree 削除前に main repo root へ `cd` する
- 削除後に `git worktree prune` を実行する
