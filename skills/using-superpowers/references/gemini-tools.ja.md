# Gemini CLI ツール対応表

スキルは Claude Code のツール名を使う。スキル内でこれらを見たら、Gemini CLI では対応するツールを使う。

| Skill references | Gemini CLI equivalent |
|-----------------|----------------------|
| `Read` (file reading) | `read_file` |
| `Write` (file creation) | `write_file` |
| `Edit` (file editing) | `replace` |
| `Bash` (run commands) | `run_shell_command` |
| `Grep` (search file content) | `grep_search` |
| `Glob` (search files by name) | `glob` |
| `TodoWrite` (task tracking) | `write_todos` |
| `Skill` tool (invoke a skill) | `activate_skill` |
| `WebSearch` | `google_web_search` |
| `WebFetch` | `web_fetch` |
| `Task` tool (dispatch subagent) | `@agent-name` |

## Subagent support

Gemini CLI は `@` syntax で subagents を native support する。任意タスクの派遣には built-in `@generalist` agent を使う。これは全 tool に access し、渡した prompt に従う。

スキルが named agent type の派遣を指示する場合、スキルの prompt template を埋め、全文を `@generalist` に渡す。

| Skill instruction | Gemini CLI equivalent |
|-------------------|----------------------|
| `Task tool (superpowers:implementer)` | filled `implementer-prompt.md` を `@generalist` に渡す |
| `Task tool (superpowers:spec-reviewer)` | filled `spec-reviewer-prompt.md` を `@generalist` に渡す |
| `Task tool (superpowers:code-reviewer)` | bundled `@code-reviewer` または filled review prompt を `@generalist` に渡す |
| `Task tool (superpowers:code-quality-reviewer)` | filled `code-quality-reviewer-prompt.md` を `@generalist` に渡す |
| `Task tool (general-purpose)` with inline prompt | inline prompt を `@generalist` に渡す |

### Prompt filling

スキルは `{WHAT_WAS_IMPLEMENTED}` や `[FULL TEXT of task]` のような placeholder を含む prompt template を提供する。すべての placeholder を埋め、完全な prompt を `@generalist` への message として渡す。template には role、review criteria、expected output format が含まれる。

### Parallel dispatch

Gemini CLI は parallel subagent dispatch をサポートする。スキルが複数の独立 subagent tasks を並列派遣するよう求めた場合、それらの `@generalist` または named subagent tasks を同じ prompt 内でまとめて要求する。依存タスクは逐次に保つが、履歴を単純にするためだけに独立タスクを直列化しない。

## Additional Gemini CLI tools

| Tool | Purpose |
|------|---------|
| `list_directory` | files/subdirectories を一覧 |
| `save_memory` | facts を GEMINI.md に保存 |
| `ask_user` | structured input を user に要求 |
| `tracker_create_task` | rich task management |
| `enter_plan_mode` / `exit_plan_mode` | 変更前に read-only research mode へ切り替える |
