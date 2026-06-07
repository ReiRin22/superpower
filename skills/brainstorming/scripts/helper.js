(function() {
  // Brainstorming のブラウザ伴走画面で動くクライアント側ヘルパー。
  // サーバーとの WebSocket 接続、クリックイベント送信、選択状態の表示更新を担当する。
  const WS_URL = 'ws://' + window.location.host;
  let ws = null;
  let eventQueue = [];

  function connect() {
    // 表示中ページを配信しているサーバーへ WebSocket で接続する。
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      // 接続前に発生したイベントをまとめて送信する。
      eventQueue.forEach(e => ws.send(JSON.stringify(e)));
      eventQueue = [];
    };

    ws.onmessage = (msg) => {
      // サーバーから reload 指示が来たら、最新の画面に更新する。
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') {
        window.location.reload();
      }
    };

    ws.onclose = () => {
      // サーバー再起動や一時切断に備えて、自動で再接続する。
      setTimeout(connect, 1000);
    };
  }

  function sendEvent(event) {
    // ユーザー操作に時刻を付けて送信する。未接続ならキューに積む。
    event.timestamp = Date.now();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    } else {
      eventQueue.push(event);
    }
  }

  // Capture clicks on choice elements
  // data-choice 属性を持つ要素のクリックを、選択イベントとしてサーバーへ送る。
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-choice]');
    if (!target) return;

    sendEvent({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice,
      id: target.id || null
    });

    // Update indicator bar (defer so toggleSelect runs first)
    // toggleSelect による selected クラス更新後、下部バーに選択状況を表示する。
    setTimeout(() => {
      const indicator = document.getElementById('indicator-text');
      if (!indicator) return;
      const container = target.closest('.options') || target.closest('.cards');
      const selected = container ? container.querySelectorAll('.selected') : [];
      if (selected.length === 0) {
        indicator.textContent = 'Click an option above, then return to the terminal';
      } else if (selected.length === 1) {
        const label = selected[0].querySelector('h3, .content h3, .card-body h3')?.textContent?.trim() || selected[0].dataset.choice;
        indicator.innerHTML = '<span class="selected-text">' + label + ' selected</span> — return to terminal to continue';
      } else {
        indicator.innerHTML = '<span class="selected-text">' + selected.length + ' selected</span> — return to terminal to continue';
      }
    }, 0);
  });

  // Frame UI: selection tracking
  // フレーム側から参照できる現在の選択値。
  window.selectedChoice = null;

  window.toggleSelect = function(el) {
    // 単一選択なら他の選択を解除し、複数選択ならクリックした項目をトグルする。
    const container = el.closest('.options') || el.closest('.cards');
    const multi = container && container.dataset.multiselect !== undefined;
    if (container && !multi) {
      container.querySelectorAll('.option, .card').forEach(o => o.classList.remove('selected'));
    }
    if (multi) {
      el.classList.toggle('selected');
    } else {
      el.classList.add('selected');
    }
    window.selectedChoice = el.dataset.choice;
  };

  // Expose API for explicit use
  // カスタム画面から明示的にイベント送信できる小さな API を公開する。
  window.brainstorm = {
    send: sendEvent,
    choice: (value, metadata = {}) => sendEvent({ type: 'choice', value, ...metadata })
  };

  connect();
})();
