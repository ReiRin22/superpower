---
name: using-git-worktrees
description: 現在のワークスペースから分離した機能作業を始める時、または実装計画の実行前に使う。ネイティブツールまたは git worktree フォールバックで分離ワークスペースを保証する
---

# Git Worktree を使う

## 概要

作業が分離されたワークスペースで行われるようにする。プラットフォームのネイティブ worktree ツールを優先し、利用できない場合だけ手動の git worktree にフォールバックする。

**中核原則:** まず既存の分離を検出する。次にネイティブツールを使う。最後に git へフォールバックする。ハーネスと戦わない。

**開始時に宣言:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Step 0: 既存の分離を検出する

**何かを作る前に、すでに分離ワークスペース内にいるか確認する。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**サブモジュール防御:** `GIT_DIR != GIT_COMMON` は git サブモジュール内でも真になる。worktree と判断する前に、サブモジュールではないことを確認する。

```bash
# パスが返るなら、worktree ではなくサブモジュール内。通常 repo として扱う
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**`GIT_DIR != GIT_COMMON` かつサブモジュールでない場合:** すでに linked worktree 内にいる。Step 3 (Project Setup) へ進む。別の worktree を作らない。

ブランチ状態を報告する:

- ブランチ上: "Already in isolated workspace at `<path>` on branch `<name>`."
- detached HEAD: "Already in isolated workspace at `<path>` (detached HEAD, externally managed). Branch creation needed at finish time."

**`GIT_DIR == GIT_COMMON` またはサブモジュール内の場合:** 通常の repo checkout にいる。

ユーザーがすでに worktree の希望を指示しているか確認する。なければ、worktree 作成前に同意を求める。

> "Would you like me to set up an isolated worktree? It protects your current branch from changes."

既存の希望があれば質問せず尊重する。ユーザーが拒否したら現在地で作業し、Step 3 へ進む。

## Step 1: 分離ワークスペースを作る

**仕組みは二つ。以下の順で試す。**

### 1a. ネイティブ Worktree ツール (推奨)

ユーザーが分離ワークスペースを求めた (Step 0 の同意) 場合、すでに worktree 作成手段があるか確認する。`EnterWorktree`、`WorktreeCreate`、`/worktree` コマンド、`--worktree` フラグのようなものかもしれない。あればそれを使い、Step 3 へ進む。

ネイティブツールはディレクトリ配置、ブランチ作成、クリーンアップを自動で扱う。ネイティブツールがあるのに `git worktree add` を使うと、ハーネスが見えない phantom state を作る。

Step 1a が使えない場合だけ Step 1b へ進む。

### 1b. Git Worktree フォールバック

**Step 1a が適用できない場合だけ使う。** ネイティブ worktree ツールがない時、git で手動作成する。

#### ディレクトリ選択

優先順位は以下。明示的なユーザー希望は観測されたファイルシステム状態より優先する。

1. **指示内に worktree ディレクトリ希望があるか確認する。** 指定があれば質問せず使う。

2. **プロジェクトローカルの既存 worktree ディレクトリを確認する:**

   ```bash
   ls -d .worktrees 2>/dev/null
   ls -d worktrees 2>/dev/null
   ```

   見つかれば使う。両方ある場合は `.worktrees` を優先する。

3. **既存のグローバルディレクトリを確認する:**

   ```bash
   project=$(basename "$(git rev-parse --show-toplevel)")
   ls -d ~/.config/superpowers/worktrees/$project 2>/dev/null
   ```

   見つかれば使う (古いグローバルパスとの互換性)。

4. **他の手がかりがなければ**、プロジェクトルートの `.worktrees/` を既定にする。

#### 安全確認 (プロジェクトローカルディレクトリのみ)

**worktree 作成前に、そのディレクトリが ignore されていることを必ず確認する:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**ignore されていない場合:** `.gitignore` に追加し、その変更をコミットしてから進む。

**重要な理由:** worktree の中身を誤ってリポジトリにコミットするのを防ぐ。

グローバルディレクトリ (`~/.config/superpowers/worktrees/`) は確認不要。

#### Worktree を作る

```bash
project=$(basename "$(git rev-parse --show-toplevel)")

# 選んだ場所に応じて path を決める
# project-local: path="$LOCATION/$BRANCH_NAME"
# global: path="~/.config/superpowers/worktrees/$project/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox フォールバック:** `git worktree add` が権限エラーで失敗した場合、sandbox が worktree 作成をブロックしたと伝え、現在のディレクトリで作業する。その後セットアップとベースラインテストをその場で実行する。

## Step 3: プロジェクトセットアップ

適切なセットアップを自動検出して実行する。

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## Step 4: クリーンなベースラインを検証する

ワークスペース開始状態がクリーンであることをテストで確認する。

```bash
# プロジェクトに合ったコマンドを使う
npm test / cargo test / pytest / go test ./...
```

**テスト失敗時:** 失敗を報告し、進むか調査するか尋ねる。

**テスト成功時:** 準備完了を報告する。

### 報告

```text
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## クイックリファレンス

| 状況 | 行動 |
|------|------|
| すでに linked worktree 内 | 作成をスキップ (Step 0) |
| サブモジュール内 | 通常 repo として扱う |
| ネイティブ worktree ツールあり | それを使う |
| ネイティブツールなし | Git worktree フォールバック |
| `.worktrees/` あり | 使う (ignore 確認) |
| `worktrees/` あり | 使う (ignore 確認) |
| 両方あり | `.worktrees/` を使う |
| どちらもなし | 指示ファイル確認後、`.worktrees/` を既定にする |
| グローバルパスあり | 使う (後方互換) |
| ディレクトリが ignore されていない | `.gitignore` に追加 + コミット |
| 作成時に権限エラー | Sandbox フォールバック、現在地で作業 |
| ベースラインテスト失敗 | 失敗を報告 + 確認 |
| package.json/Cargo.toml なし | 依存インストールをスキップ |

## よくある間違い

### ハーネスと戦う

- **問題:** プラットフォームがすでに分離を提供しているのに `git worktree add` を使う
- **修正:** Step 0 で既存分離を検出する。Step 1a でネイティブツールに委ねる。

### 検出を飛ばす

- **問題:** 既存 worktree の中に nested worktree を作る
- **修正:** 何かを作る前に必ず Step 0 を実行する

### ignore 確認を飛ばす

- **問題:** worktree 内容が追跡され、git status を汚す
- **修正:** プロジェクトローカル worktree 作成前に必ず `git check-ignore` を使う

### ディレクトリ位置を決めつける

- **問題:** 不整合を作り、プロジェクト慣習に反する
- **修正:** 既存 > グローバル legacy > 指示ファイル > 既定、の優先順位に従う

### 失敗テストのまま進む

- **問題:** 新しいバグと既存問題を区別できない
- **修正:** 失敗を報告し、進む許可を得る

## 危険信号

**絶対にしない:**

- Step 0 が既存分離を検出したのに worktree を作る
- `EnterWorktree` のようなネイティブツールがあるのに `git worktree add` を使う
- Step 1a を飛ばして Step 1b の git コマンドへ直行する
- project-local worktree が ignore されているか確認せず作る
- ベースラインテスト検証を飛ばす
- テスト失敗のまま尋ねず進む

**常にする:**

- 最初に Step 0 検出を実行する
- git フォールバックよりネイティブツールを優先する
- ディレクトリ優先順位に従う
- project-local ディレクトリが ignore されていることを確認する
- プロジェクトセットアップを自動検出して実行する
- クリーンなテストベースラインを検証する
