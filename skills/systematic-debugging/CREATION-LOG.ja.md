# 作成ログ: Systematic Debugging Skill

重要スキルを抽出し、構造化し、bulletproof 化した参照例。

## Source Material

`~/.claude/CLAUDE.md` から debugging framework を抽出した。

- 4-phase systematic process (Investigation -> Pattern Analysis -> Hypothesis -> Implementation)
- Core mandate: ALWAYS find root cause, NEVER fix symptoms
- time pressure と rationalization に耐える rule

## Extraction Decisions

**含めたもの:**

- 完全な 4-phase framework と全 rule
- anti-shortcuts ("NEVER fix symptom", "STOP and re-analyze")
- pressure-resistant language ("even if faster", "even if I seem in a hurry")
- 各 phase の具体的 steps

**除外したもの:**

- project-specific context
- 同じ rule の反復
- narrative explanations (principles へ圧縮)

## Structure Following skill-creation/SKILL.md

1. **Rich when_to_use** - symptoms と anti-patterns を含めた
2. **Type: technique** - steps 付きの具体 process
3. **Keywords** - "root cause", "symptom", "workaround", "debugging", "investigation"
4. **Flowchart** - "fix failed" 後の re-analyze vs add more fixes 判断
5. **Phase-by-phase breakdown** - scannable checklist format
6. **Anti-patterns section** - 何をしてはいけないか

## Bulletproofing Elements

圧力下の合理化に耐える framework として設計。

### Language Choices

- "ALWAYS" / "NEVER" ("should" / "try to" ではない)
- "even if faster" / "even if I seem in a hurry"
- "STOP and re-analyze"
- "Don't skip past"

### Structural Defenses

- **Phase 1 required** - implementation へ飛べない
- **Single hypothesis rule** - shotgun fixes を防ぐ
- **Explicit failure mode** - first fix が効かない時の mandatory action
- **Anti-patterns section** - shortcut がどう見えるかを示す

### Redundancy

- root cause mandate を overview + when_to_use + Phase 1 + implementation rules に配置
- "NEVER fix symptom" を複数 context で繰り返す
- 各 phase に explicit "don't skip" guidance

## Testing Approach

`skills/meta/testing-skills-with-subagents` に従い 4 validation tests を作った。

### Test 1: Academic Context

- simple bug、time pressure なし
- **Result:** 完全準拠、完全調査

### Test 2: Time Pressure + Obvious Quick Fix

- user "in a hurry"、症状修正が簡単に見える
- **Result:** shortcut に抵抗し、full process に従い、real root cause を発見

### Test 3: Complex System + Uncertainty

- multi-layer failure、root cause を見つけられるか不明
- **Result:** systematic investigation、全 layer を trace、source 発見

### Test 4: Failed First Fix

- hypothesis が効かず、さらに fixes を足したくなる
- **Result:** 停止、再分析、新仮説。shotgun なし

**All tests passed.** rationalizations なし。

## Iterations

### Initial Version

- complete 4-phase framework
- anti-patterns section
- "fix failed" decision flowchart

### Enhancement 1: TDD Reference

- skills/testing/test-driven-development への link 追加
- TDD の "simplest code" と debugging の "root cause" の違いを説明
- methodology 混同を防ぐ

## Final Outcome

bulletproof skill:

- root cause investigation を明確に mandate
- time pressure rationalization に抵抗
- 各 phase に具体 steps
- anti-patterns を明示
- 複数 pressure scenarios で test 済み
- TDD との関係を明確化
- 使用準備完了

## Key Insight

最重要 bulletproofing は、まさにその瞬間に正当化されて見える shortcuts を anti-patterns section に示すこと。Claude が "I'll just add this one quick fix" と考えた時、その exact pattern が wrong として載っていると cognitive friction が生まれる。

## Usage Example

bug に遭遇した時:

1. skill を load: `skills/debugging/systematic-debugging`
2. overview を読む (10 秒) - mandate を思い出す
3. Phase 1 checklist に従う - investigation が強制される
4. skip したくなったら anti-pattern を見て停止
5. 全 phases を完了 - root cause を発見

**Time investment:** 5-10 分  
**Time saved:** 症状叩きの数時間

---

*Created: 2025-10-03*  
*Purpose: skill extraction and bulletproofing の参照例*
