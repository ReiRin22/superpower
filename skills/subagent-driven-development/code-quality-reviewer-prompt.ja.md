# コード品質レビュアープロンプトテンプレート

コード品質レビュアーのサブエージェントを派遣する時にこのテンプレートを使う。

**目的:** 実装がよく作られているか確認する。clean、tested、maintainable。

**仕様準拠レビューが通った後にだけ派遣する。**

```text
Task tool (general-purpose):
  requesting-code-review/code-reviewer.md のテンプレートを使う

  DESCRIPTION: [implementer report からの task summary]
  PLAN_OR_REQUIREMENTS: [plan-file] の Task N
  BASE_SHA: [task 前の commit]
  HEAD_SHA: [current commit]
```

**標準のコード品質観点に加え、レビュアーは以下を確認する:**

- 各ファイルは一つの明確な責務と定義されたインターフェースを持つか
- 各単位は独立して理解・テストできるよう分解されているか
- 実装は計画のファイル構造に従っているか
- この実装で、すでに大きい新規ファイルを作ったり、既存ファイルを大幅に肥大化させたりしていないか。既存のファイルサイズではなく、この変更が加えた影響に集中する

**コードレビュアーの返答:** Strengths, Issues (Critical/Important/Minor), Assessment
