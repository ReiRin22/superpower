# Copilot CLI ツール対応表

スキルは Claude Code のツール名を使う。スキル内でこれらを見たら、Copilot CLI では対応するツールを使う。

| Skill references | Copilot CLI equivalent |
|-----------------|----------------------|
| `Read` (file reading) | `view` |
| `Write` (file creation) | `create` |
| `Edit` (file editing) | `edit` |
| `Bash` (run commands) | `bash` |
| `Grep` (search file content) | `grep` |
| `Glob` (search files by name) | `glob` |
| `Skill` tool (invoke a skill) | `skill` |
| `WebFetch` | `web_fetch` |
| `Task` tool (dispatch subagent) | `task` with `agent_type: "general-purpose"` or `"explore"` |
| Multiple `Task` calls (parallel) | 複数の `task` calls |
| Task status/output | `read_agent`, `list_agents` |
| `TodoWrite` (task tracking) | built-in `todos` table を使う `sql` |
| `WebSearch` | equivalent なし。search engine URL に `web_fetch` を使う |
| `EnterPlanMode` / `ExitPlanMode` | equivalent なし。main session に留まる |

## Async shell sessions

Copilot CLI は永続 async shell sessions をサポートする。Claude Code に直接相当するものはない。

| Tool | Purpose |
|------|---------|
| `bash` with `async: true` | long-running command を background で開始 |
| `write_bash` | 実行中 async session へ input を送る |
| `read_bash` | async session の output を読む |
| `stop_bash` | async session を終了 |
| `list_bash` | active shell sessions を一覧 |

## Additional Copilot CLI tools

| Tool | Purpose |
|------|---------|
| `store_memory` | codebase facts を future sessions 用に保存 |
| `report_intent` | UI status line の current intent を更新 |
| `sql` | session SQLite database を query (todos, metadata) |
| `fetch_copilot_cli_documentation` | Copilot CLI documentation を調べる |
| GitHub MCP tools (`github-mcp-server-*`) | native GitHub API access (issues, PRs, code search) |
