# ビジュアル伴走ガイド

モックアップ、図、選択肢を見せるためのブラウザベースのブレインストーミング伴走機能。

## 使うタイミング

セッション単位ではなく、質問ごとに判断する。基準は **読んで理解するより、見た方がユーザーに伝わりやすいか**。

**ブラウザを使う場合:** 内容自体が視覚的な時。

- **UI mockups** - wireframes, layouts, navigation structures, component designs
- **Architecture diagrams** - system components, data flow, relationship maps
- **Side-by-side visual comparisons** - layout、color scheme、design direction の比較
- **Design polish** - look and feel、spacing、visual hierarchy が論点の時
- **Spatial relationships** - state machines、flowcharts、entity relationships を図として見せる時

**ターミナルを使う場合:** 内容が文章または表で十分な時。

- **Requirements and scope questions** - "what does X mean?", "which features are in scope?"
- **Conceptual A/B/C choices** - 文章で説明された approach の選択
- **Tradeoff lists** - pros/cons、comparison tables
- **Technical decisions** - API design、data modeling、architectural approach selection
- **Clarifying questions** - 回答が visual preference ではなく言葉であるもの

UI についての質問だからといって自動的に visual question ではない。"What kind of wizard do you want?" は概念質問なので terminal。"Which of these wizard layouts feels right?" は視覚質問なので browser。

## 仕組み

server は directory 内の HTML files を監視し、最新のものを browser に配信する。`screen_dir` に HTML content を書くと、ユーザーは browser で見て選択肢をクリックできる。選択は `state_dir/events` に記録され、次のターンで読む。

**content fragments vs full documents:** HTML が `<!DOCTYPE` または `<html` で始まる場合はそのまま配信され、helper script だけ注入される。それ以外は frame template で自動的に包まれ、header、CSS theme、selection indicator、interactive infrastructure が追加される。**基本は content fragments を書く。** 完全制御が必要な時だけ full document を書く。

## セッション開始

```bash
scripts/start-server.sh --project-dir /path/to/project
```

返り値例:

```json
{"type":"server-started","port":52341,"url":"http://localhost:52341","screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/content","state_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/state"}
```

`screen_dir` と `state_dir` を保存し、ユーザーに URL を開くよう伝える。

**接続情報の探し方:** server は startup JSON を `$STATE_DIR/server-info` に書く。background 起動して stdout を捕まえていない場合は、その file を読んで URL と port を取得する。`--project-dir` 使用時は `<project>/.superpowers/brainstorm/` を確認する。

**注意:** project root を `--project-dir` として渡すと mockups は `.superpowers/brainstorm/` に永続保存され、server restart 後も残る。指定しない場合は `/tmp` に置かれ、停止時に削除される。`.superpowers/` が `.gitignore` にないなら追加を促す。

## 起動方法

**Claude Code (macOS / Linux):**

```bash
scripts/start-server.sh --project-dir /path/to/project
```

**Claude Code (Windows):**

```bash
scripts/start-server.sh --project-dir /path/to/project
```

Bash tool 経由では `run_in_background: true` を設定する。次ターンで `$STATE_DIR/server-info` を読む。

**Codex:**

```bash
scripts/start-server.sh --project-dir /path/to/project
```

Codex は background process を回収するため、script が `CODEX_CI` を検出して foreground mode に切り替える。

**Gemini CLI:**

```bash
scripts/start-server.sh --project-dir /path/to/project --foreground
```

shell tool call では `is_background: true` を設定する。

URL に到達できない場合は non-loopback host に bind する。

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

## ループ

1. **server が生きているか確認**し、`screen_dir` に新しい HTML file を書く。
   - 各 write 前に `$STATE_DIR/server-info` が存在するか確認する。なければ server が停止しているので restart する
   - semantic filenames を使う: `platform.html`, `visual-style.html`, `layout.html`
   - **filename を再利用しない**
   - Write tool を使う。**cat/heredoc は使わない**
   - server は最新 file を自動配信する

2. **ユーザーに何を見るか伝え、ターンを終える。**
   - URL を毎回 reminder する
   - 画面内容を短く要約する
   - terminal で返答するよう頼む

3. **次ターンで** terminal 返答後、`$STATE_DIR/events` があれば読む。
   - browser interactions が JSON lines で入っている
   - terminal text と統合して全体像を得る
   - terminal message が primary feedback、events は structured interaction data

4. **iterate or advance。** feedback が現画面を変えるなら新 file を書く。現在 step が validated されるまで次質問へ進まない。

5. **terminal に戻る時は unload。** 次 step が browser 不要なら waiting screen を push して stale content を消す。

```html
<div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
  <p class="subtitle">Continuing in terminal...</p>
</div>
```

6. 完了まで繰り返す。

## Content Fragments を書く

page 内に入る content だけを書く。server が frame template で包む。

```html
<h2>Which layout works better?</h2>
<p class="subtitle">Consider readability and visual hierarchy</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Single Column</h3>
      <p>Clean, focused reading experience</p>
    </div>
  </div>
</div>
```

`<html>`、CSS、`<script>` は不要。server が提供する。

## 利用可能な CSS Classes

- `.options`, `.option` - A/B/C 選択肢
- `data-multiselect` - 複数選択
- `.cards`, `.card` - visual design cards
- `.mockup`, `.mockup-header`, `.mockup-body` - mockup container
- `.split` - side-by-side comparison
- `.pros-cons`, `.pros`, `.cons` - pros/cons
- `.mock-nav`, `.mock-sidebar`, `.mock-content`, `.mock-button`, `.mock-input`, `.placeholder` - wireframe building blocks
- `h2`, `h3`, `.subtitle`, `.section`, `.label` - typography/sections

## Browser Events Format

ユーザーが browser で option をクリックすると、`$STATE_DIR/events` に 1 行 1 JSON object で記録される。新しい screen を push すると file は自動 clear される。

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Complex Grid","timestamp":1706000108}
```

event stream は探索経路を示す。最後の `choice` が最終選択であることが多いが、click pattern から迷いや好みを読み取れることもある。

`$STATE_DIR/events` がなければ browser 操作はなかった。terminal text だけを使う。

## Design Tips

- **質問に合わせて fidelity を調整** - layout は wireframe、polish は polish
- **各 page で質問を説明** - "Pick one" だけにしない
- **advance 前に iterate** - feedback が変えるなら新 version を書く
- **1 screen 最大 2-4 options**
- **必要な時は real content を使う** - placeholder は design issue を隠す
- **mockups は simple に** - pixel-perfect ではなく layout と structure に集中

## File Naming

- semantic names: `platform.html`, `visual-style.html`, `layout.html`
- filename を再利用しない
- iteration は `layout-v2.html`, `layout-v3.html`
- server は modification time が最新の file を配信する

## Cleanup

```bash
scripts/stop-server.sh $SESSION_DIR
```

`--project-dir` 使用時は mockup files が `.superpowers/brainstorm/` に残る。`/tmp` sessions だけ stop 時に削除される。

## Reference

- Frame template: `scripts/frame-template.html`
- Helper script: `scripts/helper.js`
