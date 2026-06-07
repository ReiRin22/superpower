#!/usr/bin/env bash
# Stop the brainstorm server and clean up
# Brainstorming のブラウザ伴走サーバーを停止し、一時セッションなら後片付けする。
# Usage: stop-server.sh <session_dir>
#
# Kills the server process. Only deletes session directory if it's
# under /tmp (ephemeral). Persistent directories (.superpowers/) are
# kept so mockups can be reviewed later.

SESSION_DIR="$1"

if [[ -z "$SESSION_DIR" ]]; then
  # 停止対象のセッションディレクトリがないと PID ファイルを特定できない。
  echo '{"error": "Usage: stop-server.sh <session_dir>"}'
  exit 1
fi

STATE_DIR="${SESSION_DIR}/state"
PID_FILE="${STATE_DIR}/server.pid"

if [[ -f "$PID_FILE" ]]; then
  # PID ファイルがある場合は、そのプロセスを停止対象として扱う。
  pid=$(cat "$PID_FILE")

  # Try to stop gracefully, fallback to force if still alive
  # まず通常の kill で終了を促す。
  kill "$pid" 2>/dev/null || true

  # Wait for graceful shutdown (up to ~2s)
  # 最大約 2 秒待ち、正常終了するか確認する。
  for i in {1..20}; do
    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi
    sleep 0.1
  done

  # If still running, escalate to SIGKILL
  # まだ生きている場合だけ SIGKILL に切り替える。
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true

    # Give SIGKILL a moment to take effect
    sleep 0.1
  fi

  if kill -0 "$pid" 2>/dev/null; then
    echo '{"status": "failed", "error": "process still running"}'
    exit 1
  fi

  rm -f "$PID_FILE" "${STATE_DIR}/server.log"

  # Only delete ephemeral /tmp directories
  # project-dir 指定の永続保存は残し、/tmp の一時セッションだけ削除する。
  if [[ "$SESSION_DIR" == /tmp/* ]]; then
    rm -rf "$SESSION_DIR"
  fi

  echo '{"status": "stopped"}'
else
  echo '{"status": "not_running"}'
fi
