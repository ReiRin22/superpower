# Claude Code Skills Tests

Claude Code CLI を使って Superpowers skills を検証する自動テスト。

## 概要

この test suite は、skills が正しく読み込まれ、Claude が期待通りに従うことを確認する。テストは Claude Code を headless mode (`claude -p`) で呼び出し、挙動を検証する。

## 要件

- Claude Code CLI が install 済みで PATH にあること (`claude --version` が動く)
- local superpowers plugin が install 済みであること (main README の installation を参照)

## テスト実行

### fast tests をすべて実行 (推奨)

```bash
./run-skill-tests.sh
```

### integration tests を実行 (遅い、10-30 分)

```bash
./run-skill-tests.sh --integration
```

### specific test を実行

```bash
./run-skill-tests.sh --test test-subagent-driven-development.sh
```

### verbose output 付きで実行

```bash
./run-skill-tests.sh --verbose
```

### custom timeout を設定

```bash
./run-skill-tests.sh --timeout 1800  # integration tests 用 30 分
```

## Test Structure

### test-helpers.sh

skills testing 用の共通関数。

- `run_claude "prompt" [timeout]` - prompt 付きで Claude を実行
- `assert_contains output pattern name` - pattern が存在することを確認
- `assert_not_contains output pattern name` - pattern が存在しないことを確認
- `assert_count output pattern count name` - 正確な count を確認
- `assert_order output pattern_a pattern_b name` - 出現順を確認
- `create_test_project` - temp test directory を作成
- `create_test_plan project_dir` - sample plan file を作成

### Test Files

各 test file は:

1. `test-helpers.sh` を source する
2. specific prompts で Claude Code を実行する
3. assertions で expected behavior を検証する
4. 成功時 0、失敗時 non-zero を返す

## Example Test

```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

echo "=== Test: My Skill ==="

output=$(run_claude "What does the my-skill skill do?" 30)

assert_contains "$output" "expected behavior" "Skill describes behavior"

echo "=== All tests passed ==="
```

## Current Tests

### Fast Tests

#### test-subagent-driven-development.sh

skill content と requirements を検証する (~2 分)。

- Skill loading and accessibility
- Workflow ordering (spec compliance before code quality)
- Self-review requirements documented
- Plan reading efficiency documented
- Spec compliance reviewer skepticism documented
- Review loops documented
- Task context provision documented

### Integration Tests

#### test-subagent-driven-development-integration.sh

full workflow execution test (~10-30 分)。

- real test project with Node.js setup を作成
- 2 tasks の implementation plan を作成
- subagent-driven-development で plan を実行
- 実際の behavior を検証
  - plan は開始時に 1 回だけ読まれる
  - full task text が subagent prompts に渡される
  - subagents は報告前に self-review する
  - spec compliance review が code quality より前に行われる
  - spec reviewer が code を独立して読む
  - working implementation が作られる
  - tests pass
  - proper git commits が作られる

#### test-requesting-code-review.sh

code reviewer subagent の behavioral test (~5 分)。

- tiny project と baseline commit を作る
- second commit で 2 つの real bugs を埋め込む (SQL injection、plaintext password handling)
- requesting-code-review skill 経由で code reviewer を派遣
- reviewer が planted bugs を Critical/Important として flag し、approve しないことを検証

## 新しいテストの追加

1. 新しい test file を作成: `test-<skill-name>.sh`
2. `test-helpers.sh` を source
3. `run_claude` と assertions で test を書く
4. `run-skill-tests.sh` の test list に追加
5. executable にする: `chmod +x test-<skill-name>.sh`

## Timeout Considerations

- default timeout: test ごとに 5 分
- Claude Code の応答には時間がかかる場合がある
- 必要なら `--timeout` で調整
- 長時間実行を避けるため、tests は focused にする

## Failed Tests のデバッグ

`--verbose` を使うと Claude output 全体が見える。

```bash
./run-skill-tests.sh --verbose --test test-subagent-driven-development.sh
```

verbose なしでは failure のみ output を表示する。

## CI/CD Integration

```bash
./run-skill-tests.sh --timeout 900
```

exit code 0 = success、non-zero = failure。

## Notes

- tests は skill instructions を検証し、完全実行を検証するものではない
- full workflow tests は非常に遅くなり得る
- key skill requirements の検証に集中する
- tests は deterministic にする
- implementation details を test しない
