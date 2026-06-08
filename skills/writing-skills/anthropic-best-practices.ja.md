# スキル作成ベストプラクティス

> Claude が発見し、正しく使える効果的な Skill を書くための実用ガイド。

良い Skill は簡潔で、構造化され、実利用でテストされている。このガイドは、Claude が Skill を見つけて効果的に使えるようにするための作成判断をまとめる。

## 中核原則

### 簡潔さが重要

context window は共有資源である。Skill は system prompt、conversation history、他 Skill の metadata、実際の request と context を共有する。

起動時に読み込まれるのはすべての Skill の metadata (`name`, `description`) だけだが、Skill が relevant になって `SKILL.md` が読み込まれた後は、その token も会話履歴や他 context と競合する。

**既定の仮定:** Claude はすでに非常に賢い。

各情報について問う。

- Claude は本当にこの説明を必要とするか
- Claude がすでに知っていると仮定できるか
- この段落は token cost に見合うか

**良い例: 簡潔**

```markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

**悪い例:** PDF とは何か、library とは何か、なぜ必要かを長く説明する。Claude がすでに知っていることを繰り返す。

### 自由度を適切に設定する

task の fragility と variability に合わせて具体度を選ぶ。

**High freedom:** 複数 approach が妥当で、context に依存する場合。heuristics を示す。

**Medium freedom:** preferred pattern はあるが、ある程度 variation が許される場合。pseudocode や configurable script が向く。

**Low freedom:** fragile で error-prone、順序や一貫性が重要な場合。exact script と guardrails を示す。

比喩: Claude が path を進む robot だと考える。

- 崖のある細い橋: exact instructions
- 危険のない広い field: general direction

### 使用予定の model でテストする

Skill は model への追加 instruction なので、効果は base model に依存する。

- Haiku: 十分な guidance があるか
- Sonnet: 明確で効率的か
- Opus: over-explaining していないか

複数 model で使うなら、全 model でうまく動く instruction を目指す。

## Skill structure

`SKILL.md` の YAML frontmatter は以下を持つ。

- `name` - Skill 名
- `description` - 何をするか、いつ使うかの 1 行説明

### Naming conventions

一貫した naming pattern を使う。動作や capability が分かりやすいので gerund form が推奨。

良い例:

- Processing PDFs
- Analyzing spreadsheets
- Managing databases
- Testing code
- Writing documentation

避ける:

- Helper, Utils, Tools
- Documents, Data, Files のように generic
- collection 内で inconsistent な pattern

### Effective descriptions

`description` は Skill discovery の鍵である。Claude は 100+ Skill の中からこれを読んで選ぶ。

**常に三人称で書く。**

良い:

```yaml
description: Extracts text and tables from PDF files, fills forms, merges documents. Use when working with PDF files or document extraction.
```

悪い:

```yaml
description: I can help you process Excel files
```

具体的な trigger/context/key terms を入れる。曖昧な "Helps with documents" や "Processes data" は避ける。

## Progressive disclosure

`SKILL.md` は overview と navigation にし、必要時だけ詳細 file を読む構造にする。

実用 guidance:

- `SKILL.md` body は 500 lines 未満を目安にする
- 長くなりそうなら別 file へ分ける
- instructions、code、resources を役割別に整理する

### Pattern 1: high-level guide with references

`SKILL.md` に quick start を置き、advanced features や API reference は別 file へ link する。

### Pattern 2: domain-specific organization

複数 domain がある Skill では domain ごとに reference を分ける。user が sales metrics を聞いた時に finance/marketing reference まで読ませない。

### Pattern 3: conditional details

basic content を inline にし、advanced content へ link する。

### 深い nested references を避ける

reference は `SKILL.md` から 1 level deep に保つ。reference からさらに reference へ辿らせると、partial read で情報が欠けることがある。

### 長い reference file には目次を置く

100 lines を超える reference には top に table of contents を入れる。partial preview でも全体像が見える。

## Workflows and feedback loops

複雑な task は明確な sequential steps に分ける。特に複雑なら checklist を提供し、Claude が progress を track できるようにする。

典型 pattern:

```text
run validator -> fix errors -> repeat
```

これは output quality を大きく改善する。

## Skills with executable code

Markdown instruction だけの Skill ならこの section は不要。script を含む Skill では以下を守る。

### Solve, don't punt

script は error conditions を Claude に丸投げせず、自分で扱う。

良い:

- file not found なら default を作る
- permission error なら alternative を返す
- error message が具体的

悪い:

- ただ open して失敗させる

### voodoo constants を避ける

configuration value は理由をコメントで説明する。

```python
# HTTP requests typically complete within 30 seconds.
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed.
MAX_RETRIES = 3
```

### Utility scripts を提供する

事前作成 script は生成 code より信頼性が高く、token と時間を節約し、一貫性を保つ。

instruction では Claude が script を **実行する** のか、**参照として読む** のか明確にする。

- "Run `analyze_form.py` to extract fields" - execute
- "See `analyze_form.py` for the algorithm" - read

### Visual analysis を使う

input が画像化できるなら、Claude に visual analysis させる。PDF form なら page image へ変換し、field locations/types を視覚的に理解できる。

### 検証可能な中間出力を作る

complex task では "plan-validate-execute" pattern を使う。

1. plan file を作る
2. validation script で検証する
3. 問題を修正する
4. 実行する
5. 結果を verify する

destructive changes、batch operations、high-stakes operations に有効。

## Runtime environment

Skill は filesystem access、bash commands、code execution capabilities を持つ code execution environment で動く。

Claude の access pattern:

1. metadata は startup で pre-loaded
2. files は必要時に read
3. scripts は full contents を context に入れず実行できる
4. large reference は読まれるまで context cost なし

authoring への影響:

- path は forward slash を使う
- file name は descriptive にする
- domain/feature で organize する
- deterministic operation は script 化する
- execution intent を明確にする
- file access pattern を real requests で test する

## MCP tool references

MCP tools を使う Skill では fully qualified tool names を使う。

```markdown
Use the BigQuery:bigquery_schema tool.
Use the GitHub:create_issue tool.
```

server prefix がないと、複数 MCP server がある時に tool not found になりやすい。

## Tools/packages を仮定しない

package が installed と仮定しない。

悪い:

```markdown
Use the pdf library.
```

良い:

```markdown
Install required package: `pip install pypdf`
```

## 技術メモ

- frontmatter は `name` と `description` が必須
- `SKILL.md` body は 500 lines 未満を目安
- 超える場合は progressive disclosure で別 file へ分割

## Effective Skills Checklist

### Core quality

- [ ] description が具体的で key terms を含む
- [ ] description が what と when を含む
- [ ] `SKILL.md` body が 500 lines 未満
- [ ] 必要なら詳細は別 file
- [ ] time-sensitive information がない
- [ ] terminology が一貫
- [ ] examples が concrete
- [ ] file references は one level deep
- [ ] progressive disclosure を適切に使用
- [ ] workflow steps が明確

### Code and scripts

- [ ] script は問題を解決し、Claude に丸投げしない
- [ ] error handling が explicit で helpful
- [ ] voodoo constants がない
- [ ] required packages が記載され利用可能
- [ ] scripts に明確な documentation
- [ ] Windows-style paths なし
- [ ] critical operations に validation/verification
- [ ] quality-critical tasks に feedback loops

### Testing

- [ ] 3+ evaluations がある
- [ ] Haiku, Sonnet, Opus で test 済み
- [ ] real usage scenarios で test 済み
- [ ] team feedback を取り込んだ
