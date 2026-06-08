# Codex ツール対応表

スキルは Claude Code のツール名を使う。スキル内でこれらを見たら、Codex では対応するツールを使う。

| Skill references | Codex equivalent |
|-----------------|------------------|
| `Task` tool (dispatch subagent) | `spawn_agent` |
| Multiple `Task` calls (parallel) | 複数の `spawn_agent` calls |
| Task returns result | `wait_agent` |
| Task completes automatically | slot 解放のため `close_agent` |
| `TodoWrite` (task tracking) | `update_plan` |
| `Skill` tool (invoke a skill) | Skills は native に読み込まれる。指示に従う |
| `Read`, `Write`, `Edit` (files) | native file tools を使う |
| `Bash` (run commands) | native shell tools を使う |

## Subagent dispatch requires multi-agent support

Codex config (`~/.codex/config.toml`) に追加する。

```toml
[features]
multi_agent = true
```

これにより `dispatching-parallel-agents` や `subagent-driven-development` で使う `spawn_agent`、`wait_agent`、`close_agent` が有効になる。

古い Codex では spawned-agent waiting が `wait` として公開されていた。現在の Codex は spawned agents に `wait_agent` を使う。`wait` は code-mode の `exec/wait` 用であり、spawned-agent result tool ではない。

## Environment Detection

worktree 作成や branch 仕上げを行うスキルは、進む前に read-only git commands で環境を検出する。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` -> すでに linked worktree 内 (作成を skip)
- `BRANCH` empty -> detached HEAD (sandbox から branch/push/PR できない)

各スキルでの使い方は `using-git-worktrees` Step 0 と `finishing-a-development-branch` Step 1 を参照。

## Codex App Finishing

sandbox が branch/push operations をブロックする場合、エージェントはすべての作業を commit し、App の native controls を使うようユーザーに伝える。

- **"Create branch"** - branch 名を付け、App UI から commit/push/PR
- **"Hand off to local"** - 作業をユーザーの local checkout へ転送

エージェントは引き続き tests 実行、files staging、branch name、commit message、PR description の提案ができる。
