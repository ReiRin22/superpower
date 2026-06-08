# サブエージェントでスキルをテストする

**読み込むタイミング:** skill を作成/編集し、deployment 前に pressure と rationalization に耐えるか検証する時。

## 概要

**skill testing は process documentation に適用した TDD である。**

skill なしで scenario を実行し (RED - agent が失敗するのを見る)、その失敗に対応する skill を書き (GREEN - agent が従うのを見る)、抜け穴を塞ぐ (REFACTOR - compliant のまま保つ)。

**中核原則:** skill なしで agent が失敗するのを見ていないなら、その skill が正しい failure を防ぐか分からない。

**必須背景:** この skill を使う前に superpowers:test-driven-development を理解していること。これは RED-GREEN-REFACTOR の基本 cycle を定義する。本書は skill-specific test formats を提供する。

完全な worked example は `examples/CLAUDE_MD_TESTING.md` を参照。

## 使うタイミング

test する skill:

- discipline を enforce する (TDD, testing requirements)
- compliance cost がある (time, effort, rework)
- "just this once" と rationalize され得る
- immediate goals と衝突する (speed over quality)

test しない:

- pure reference skills
- 違反できる rules がない skills
- agent が bypass する incentive を持たない skills

## TDD Mapping

| TDD Phase | Skill Testing | What You Do |
|-----------|---------------|-------------|
| **RED** | Baseline test | skill なしで scenario 実行、agent failure を見る |
| **Verify RED** | rationalizations capture | exact failures を verbatim 記録 |
| **GREEN** | skill を書く | baseline failures に対応 |
| **Verify GREEN** | pressure test | skill ありで scenario 実行、compliance を確認 |
| **REFACTOR** | holes を塞ぐ | new rationalizations を見つけ counter を追加 |
| **Stay GREEN** | re-verify | 再テストし compliant を確認 |

## RED Phase: Baseline Testing

**Goal:** skill なしで test を実行し、agent が失敗するのを見て、正確に記録する。

これは TDD の "write failing test first" と同じ。skill を書く前に、agent が自然に何をするかを見る必要がある。

**Process:**

- [ ] pressure scenarios を作る (3+ combined pressures)
- [ ] skill なしで実行する
- [ ] choices と rationalizations を word-for-word で記録する
- [ ] patterns を特定する
- [ ] effective pressures を記録する

## GREEN Phase: Minimal Skill

documented baseline failures に対応する skill を書く。仮定上の case へ余計な内容を追加せず、観察した failures に enough なものを書く。

同じ scenario を skill ありで実行する。agent は従うべきである。

agent がまだ失敗するなら、skill は不明確または不完全。修正して再テストする。

## VERIFY GREEN: Pressure Testing

**Goal:** agent が破りたくなる時にも rules に従うか確認する。

良い scenario は realistic で複数 pressure を持つ。

**Pressure Types:**

| Pressure | Example |
|----------|---------|
| **Time** | emergency, deadline, deploy window |
| **Sunk cost** | hours of work, "waste" to delete |
| **Authority** | senior says skip it, manager overrides |
| **Economic** | job, promotion, company survival |
| **Exhaustion** | end of day, tired |
| **Social** | looking dogmatic |
| **Pragmatic** | "pragmatic vs dogmatic" |

best tests は 3+ pressures を組み合わせる。

### Good Scenario の要素

1. concrete options - A/B/C の選択を強制する
2. real constraints - times, consequences
3. real file paths
4. agent に act させる
5. easy outs を作らない

setup:

```markdown
IMPORTANT: This is a real scenario. You must choose and act.
Don't ask hypothetical questions - make the actual decision.

You have access to: [skill-being-tested]
```

## REFACTOR Phase: 抜け穴を塞ぐ

skill があるのに agent が rule を破ったなら test regression と同じ。skill を refactor する必要がある。

**新しい rationalizations を verbatim で捕まえる:**

- "This case is different because..."
- "I'm following the spirit not the letter"
- "Being pragmatic means adapting"
- "Deleting X hours is wasteful"
- "Keep as reference while writing tests first"

これらが rationalization table になる。

### 各 hole の塞ぎ方

1. rules で explicit negation を追加する
2. rationalization table に entry を追加する
3. red flags に entry を追加する
4. description に violation symptoms を追加する

### Re-verify

updated skill で同じ scenario を再テストする。agent は:

- correct option を選ぶ
- 新 sections を cite する
- previous rationalization が address されたと認める

new rationalization が出たら REFACTOR cycle を続ける。

## Meta-Testing

agent が wrong option を選んだ後、こう尋ねる。

```markdown
You read the skill and chose Option C anyway.

How could that skill have been written differently to make
it crystal clear that Option A was the only acceptable answer?
```

可能な response:

1. "The skill WAS clear, I chose to ignore it" - stronger foundational principle が必要
2. "The skill should have said X" - documentation problem。suggestion を追加
3. "I didn't see section Y" - organization problem。key points を目立たせる

## Bulletproof の兆候

1. maximum pressure 下で correct option を選ぶ
2. skill sections を justification として cite する
3. temptation を認めつつ rule に従う
4. meta-testing で "skill was clear, I should follow it" が出る

bulletproof でない兆候:

- new rationalizations
- skill が wrong と argument する
- hybrid approaches を作る
- permission を尋ねつつ violation を強く主張する

## Checklist

**RED Phase:**

- [ ] pressure scenarios を作った
- [ ] skill なしで baseline を実行した
- [ ] agent failures と rationalizations を verbatim 記録した

**GREEN Phase:**

- [ ] baseline failures に対応する skill を書いた
- [ ] skill ありで scenarios を実行した
- [ ] agent が従う

**REFACTOR Phase:**

- [ ] new rationalizations を特定した
- [ ] loophole ごとに explicit counters を追加した
- [ ] rationalization table を更新した
- [ ] red flags list を更新した
- [ ] description に violation symptoms を追加した
- [ ] 再テストし compliant を確認した
- [ ] meta-tested で clarity を検証した

## よくある間違い

**悪い:** skill before testing (RED skip)  
**修正:** baseline scenarios を先に実行する

**悪い:** academic tests だけ  
**修正:** agent が rule を破りたくなる pressure scenarios を使う

**悪い:** single pressure  
**修正:** time + sunk cost + exhaustion のように 3+ pressures を組み合わせる

**悪い:** exact failures を記録しない  
**修正:** rationalizations を verbatim で記録する

**悪い:** generic counters  
**修正:** specific rationalization ごとに explicit negation を追加する

**悪い:** first pass で止める  
**修正:** new rationalization がなくなるまで REFACTOR cycle を続ける

## 結論

**skill creation は TDD である。同じ原則、同じ cycle、同じ利点。**

テストなしに code を書かないなら、agent で test せず skill も書かない。
