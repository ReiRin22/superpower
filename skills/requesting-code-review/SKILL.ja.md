---
name: requesting-code-review
description: タスク完了時、大きな機能の実装後、またはマージ前に、作業が要件を満たしているか確認するために使う
---

# コードレビューを依頼する

問題が連鎖する前に捕まえるため、コードレビュー用サブエージェントを呼び出す。レビュアーには評価に必要な文脈だけを正確に渡し、自分のセッション履歴は渡さない。これによりレビュアーは思考過程ではなく成果物に集中でき、自分の作業文脈も温存できる。

**中核原則:** 早くレビューし、頻繁にレビューする。

## レビューを依頼するタイミング

**必須:**

- サブエージェント駆動開発の各タスク後
- 大きな機能を完了した後
- main へマージする前

**任意だが有用:**

- 詰まった時 (新しい視点)
- リファクタリング前 (基準確認)
- 複雑なバグを修正した後

## 依頼方法

**1. git SHA を取得する:**

```bash
BASE_SHA=$(git rev-parse HEAD~1)  # または origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. コードレビュアーのサブエージェントを呼び出す:**

Task ツールで `general-purpose` 型を使い、`code-reviewer.md` のテンプレートを埋める。

**プレースホルダー:**

- `{DESCRIPTION}` - 作ったものの短い要約
- `{PLAN_OR_REQUIREMENTS}` - 何を満たすべきか
- `{BASE_SHA}` - 開始コミット
- `{HEAD_SHA}` - 終了コミット

**3. フィードバックに対応する:**

- Critical は即修正する
- Important は先へ進む前に修正する
- Minor は後回しとして記録する
- レビュアーが間違っている場合は、理由を添えて反論する

## 例

```text
[Task 2: Add verification function を完了した直後]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[コードレビュアーサブエージェントを呼び出す]
  DESCRIPTION: verifyIndex() と repairIndex() を追加し、4 種類の問題に対応
  PLAN_OR_REQUIREMENTS: docs/superpowers/plans/deployment-plan.md の Task 2
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[サブエージェントの返答]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [進捗表示を修正]
[Task 3 へ進む]
```

## ワークフローとの統合

**サブエージェント駆動開発:**

- 各タスク後にレビューする
- 問題が積み重なる前に捕まえる
- 次タスクへ進む前に修正する

**計画実行:**

- 各タスク後、または自然なチェックポイントでレビューする
- フィードバックを受け、適用し、続ける

**アドホック開発:**

- マージ前にレビューする
- 詰まった時にレビューする

## 危険信号

**絶対にしない:**

- 「単純だから」とレビューを飛ばす
- Critical issue を無視する
- Important issue を未修正のまま進む
- 妥当な技術フィードバックと口論する

**レビュアーが間違っている場合:**

- 技術的理由で反論する
- 動作を証明するコードやテストを示す
- 説明を求める

テンプレート: `requesting-code-review/code-reviewer.md`
