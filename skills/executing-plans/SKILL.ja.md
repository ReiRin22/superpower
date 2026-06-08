---
name: executing-plans
description: レビュー用チェックポイント付きで、別セッションで書かれた実装計画を実行するときに使う
---

# 計画を実行する

## 概要

計画を読み込み、批判的にレビューし、すべてのタスクを実行し、完了時に報告する。

**開始時に宣言:** "I'm using the executing-plans skill to implement this plan."

**注意:** Superpowers はサブエージェントにアクセスできる環境でよりよく機能することを human partner に伝える。Claude Code や Codex など、サブエージェント対応プラットフォームで実行すると作業品質が大きく上がる。サブエージェントが使えるなら、このスキルではなく superpowers:subagent-driven-development を使う。

## プロセス

### Step 1: 計画を読み込みレビューする

1. 計画ファイルを読む
2. 批判的にレビューし、計画への疑問や懸念を特定する
3. 懸念があれば、開始前に human partner へ伝える
4. 懸念がなければ TodoWrite を作成して進む

### Step 2: タスクを実行する

各タスクについて:

1. `in_progress` にする
2. 各ステップに正確に従う (計画は小さなステップで書かれている)
3. 指定された検証を実行する
4. `completed` にする

### Step 3: 開発を完了する

すべてのタスクが完了し検証された後:

- 宣言する: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** superpowers:finishing-a-development-branch を使う
- そのスキルに従い、テスト検証、選択肢提示、選ばれた実行を行う

## 停止して助けを求めるべき時

**以下では即座に実行を停止する:**

- ブロッカーに当たった (依存関係不足、テスト失敗、指示不明)
- 計画に開始を妨げる重大な欠落がある
- 指示を理解できない
- 検証が繰り返し失敗する

**推測するのではなく確認する。**

## 前のステップへ戻るべき時

**Review (Step 1) に戻る場合:**

- partner がフィードバックをもとに計画を更新した
- 根本的なアプローチの再検討が必要になった

**ブロッカーを無理に押し通さない** - 停止して尋ねる。

## 忘れないこと

- まず計画を批判的にレビューする
- 計画のステップに正確に従う
- 検証を飛ばさない
- 計画で指示されたスキルを参照する
- ブロックされたら止まる。推測しない
- ユーザーの明示的同意なしに main/master ブランチで実装を始めない

## 連携

**必須ワークフロースキル:**

- **superpowers:using-git-worktrees** - 分離された作業空間を保証する (作成または既存確認)
- **superpowers:writing-plans** - このスキルが実行する計画を作る
- **superpowers:finishing-a-development-branch** - すべてのタスク後に開発を完了する
