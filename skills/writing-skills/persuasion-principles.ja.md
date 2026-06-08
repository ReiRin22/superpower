# スキル設計の説得原理

## 概要

LLM は人間と同じ説得原理に反応する。この心理を理解すると、圧力下でも重要な practice が守られるよう、より効果的な skill を設計できる。目的は操作ではなく、予測可能な失敗を防ぐこと。

**研究基盤:** Meincke et al. (2025) は N=28,000 の AI conversations で 7 つの persuasion principles を test した。persuasion techniques は compliance rates を 33% から 72% へ倍増させた (p < .001)。

## 7 つの原理

### 1. Authority

**何か:** expertise、credentials、official sources への defer。

**skills での使い方:**

- imperative language: "YOU MUST", "Never", "Always"
- non-negotiable framing: "No exceptions"
- decision fatigue と rationalization を減らす

**使う時:**

- discipline-enforcing skills (TDD, verification)
- safety-critical practices
- established best practices

例:

```markdown
良: Write code before test? Delete it. Start over. No exceptions.
悪: Consider writing tests first when feasible.
```

### 2. Commitment

**何か:** prior actions、statements、public declarations との consistency。

**skills での使い方:**

- announcement を要求する
- explicit choices を強制する
- TodoWrite などで tracking する

**使う時:**

- skill が実際に follow されることを保証する
- multi-step processes
- accountability mechanisms

### 3. Scarcity

**何か:** time limits や limited availability による urgency。

**skills での使い方:**

- "Before proceeding" のような time-bound requirements
- "Immediately after X" のような sequential dependencies
- "I'll do it later" を防ぐ

### 4. Social Proof

**何か:** others がすること、normal とされることへの conformity。

**skills での使い方:**

- "Every time", "Always" の universal patterns
- "X without Y = failure"
- norms を確立する

### 5. Unity

**何か:** shared identity、"we-ness"、in-group belonging。

**skills での使い方:**

- "our codebase", "we're colleagues"
- shared goals: "we both want quality"

**使う時:**

- collaborative workflows
- team culture
- non-hierarchical practices

### 6. Reciprocity

**何か:** 受けた benefit を返す obligation。

**skills では:** manipulative に感じやすいので sparingly。ほとんど不要。

### 7. Liking

**何か:** 好きな相手に協力しやすい傾向。

**skills では:** compliance 目的に使わない。honest feedback culture と衝突し、sycophancy を生む。

## Skill Type ごとの組み合わせ

| Skill Type | Use | Avoid |
|------------|-----|-------|
| Discipline-enforcing | Authority + Commitment + Social Proof | Liking, Reciprocity |
| Guidance/technique | Moderate Authority + Unity | Heavy authority |
| Collaborative | Unity + Commitment | Authority, Liking |
| Reference | Clarity only | All persuasion |

## なぜ効くか

**明確な rules は rationalization を減らす。**

- "YOU MUST" は decision fatigue を取り除く
- absolute language は "これは例外か?" を減らす
- explicit anti-rationalization counters は抜け穴を塞ぐ

**implementation intentions は automatic behavior を作る。**

- clear triggers + required actions = automatic execution
- "When X, do Y" は "generally do Y" より効果的
- compliance の cognitive load を下げる

**LLM は parahuman。**

- human text にある patterns で trained
- authority language は training data で compliance と結びつきやすい
- commitment sequence (statement -> action) がよく modeling される
- social proof patterns は norms を確立する

## 倫理的使用

**正当:**

- critical practices を守らせる
- effective documentation を作る
- predictable failures を防ぐ

**不当:**

- personal gain のために操作する
- false urgency を作る
- guilt-based compliance

**テスト:** ユーザーが fully understand しても、その technique は user の genuine interests に役立つか?

## Research Citations

**Cialdini, R. B. (2021).** *Influence: The Psychology of Persuasion (New and Expanded).* Harper Business.

**Meincke, L., Shapiro, D., Duckworth, A. L., Mollick, E., Mollick, L., & Cialdini, R. (2025).** Call Me A Jerk: Persuading AI to Comply with Objectionable Requests. University of Pennsylvania.

## Quick Reference

skill を設計する時に問う:

1. **type は何か?** discipline、guidance、reference
2. **どの behavior を変えたいか?**
3. **どの principle が適用されるか?**
4. **組み合わせすぎていないか?**
5. **倫理的か?** user の genuine interests に役立つか?
