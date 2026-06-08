# 仕様ドキュメントレビュアープロンプトテンプレート

仕様ドキュメントレビュアーのサブエージェントを派遣する時にこのテンプレートを使う。

**目的:** 仕様が完全で、一貫しており、実装計画作成の準備ができているか確認する。

**派遣タイミング:** 仕様ドキュメントを `docs/superpowers/specs/` に書いた後。

```text
Task tool (general-purpose):
  description: "Review spec document"
  prompt: |
    あなたは仕様ドキュメントレビュアーです。この仕様が完全で、計画作成の準備ができているか確認してください。

    **レビュー対象仕様:** [SPEC_FILE_PATH]

    ## 確認すること

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | TODO、placeholder、"TBD"、不完全セクション |
    | Consistency | 内部矛盾、競合する要件 |
    | Clarity | 二通りに解釈でき、間違った実装を招くほど曖昧な要件 |
    | Scope | 単一計画に収まるか。複数の独立サブシステムではないか |
    | YAGNI | 要求されていない機能、over-engineering |

    ## Calibration

    **実装計画作成中に本当の問題を起こす issue だけを指摘してください。**
    欠けたセクション、矛盾、二通りに解釈できるほど曖昧な要件は issue です。
    軽微な wording、style preference、「他セクションより詳細が少ない」は issue ではありません。

    flawed plan につながる深刻な gaps がない限り承認してください。

    ## Output Format

    ## Spec Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - [Section X]: [具体的 issue] - [なぜ planning に影響するか]

    **Recommendations (advisory, do not block approval):**
    - [改善提案]
```

**レビュアーの返答:** Status, Issues (if any), Recommendations
