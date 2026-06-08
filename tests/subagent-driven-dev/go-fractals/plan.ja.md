# Go Fractals CLI - 実装計画

この計画は `superpowers:subagent-driven-development` skill を使って実行する。

## Context

ASCII fractals を生成する CLI tool を作る。完全な specification は `design.md` を参照。

## Tasks

### Task 1: Project Setup

Go module と directory structure を作る。

**Do:**

- module name `github.com/superpowers-test/fractals` で `go.mod` を初期化
- directory structure を作成: `cmd/fractals/`, `internal/sierpinski/`, `internal/mandelbrot/`, `internal/cli/`
- "fractals cli" を出力する minimal `cmd/fractals/main.go` を作成
- `github.com/spf13/cobra` dependency を追加

**Verify:**

- `go build ./cmd/fractals` succeeds
- `./fractals` prints "fractals cli"

---

### Task 2: CLI Framework with Help

Cobra root command と help output を設定する。

**Do:**

- `internal/cli/root.go` に root command を作成
- available subcommands を表示する help text を設定
- root command を `main.go` に wire

**Verify:**

- `./fractals --help` が usage と `sierpinski` / `mandelbrot` を表示する
- `./fractals` (no args) が help を表示する

---

### Task 3: Sierpinski Algorithm

Sierpinski triangle generation algorithm を実装する。

**Do:**

- `internal/sierpinski/sierpinski.go` を作成
- `Generate(size, depth int, char rune) []string` を実装
- recursive midpoint subdivision algorithm を使う
- `internal/sierpinski/sierpinski_test.go` に tests を追加
  - small triangle (size=4, depth=2) が expected output と一致
  - size=1 は single character を返す
  - depth=0 は filled triangle を返す

**Verify:**

- `go test ./internal/sierpinski/...` passes

---

### Task 4: Sierpinski CLI Integration

Sierpinski algorithm を CLI subcommand に接続する。

**Do:**

- `internal/cli/sierpinski.go` に `sierpinski` subcommand を作成
- flags: `--size` (default 32), `--depth` (default 5), `--char` (default '*')
- `sierpinski.Generate()` を呼び、stdout に print

**Verify:**

- `./fractals sierpinski` outputs a triangle
- `./fractals sierpinski --size 16 --depth 3` outputs smaller triangle
- `./fractals sierpinski --help` shows flag documentation

---

### Task 5: Mandelbrot Algorithm

Mandelbrot set ASCII renderer を実装する。

**Do:**

- `internal/mandelbrot/mandelbrot.go` を作成
- `Render(width, height, maxIter int, char string) []string` を実装
- complex plane region (-2.5 to 1.0 real, -1.0 to 1.0 imaginary) を output dimensions に map
- iteration count を character gradient `" .:-=+*#%@"` に map。char 指定時は single char を使う
- `internal/mandelbrot/mandelbrot_test.go` に tests を追加
  - output dimensions が requested width/height と一致
  - set 内の known point (0,0) が max-iteration character に map
  - set 外の known point (2,0) が low-iteration character に map

**Verify:**

- `go test ./internal/mandelbrot/...` passes

---

### Task 6: Mandelbrot CLI Integration

Mandelbrot algorithm を CLI subcommand に接続する。

**Do:**

- `internal/cli/mandelbrot.go` に `mandelbrot` subcommand を作成
- flags: `--width`, `--height`, `--iterations`, `--char`
- `mandelbrot.Render()` を呼び、stdout に print

**Verify:**

- `./fractals mandelbrot` outputs recognizable Mandelbrot set
- `./fractals mandelbrot --width 40 --height 12` outputs smaller version
- `./fractals mandelbrot --help` shows flag documentation

---

### Task 7: Character Set Configuration

両 command で `--char` flag が一貫して動くようにする。

**Do:**

- Sierpinski `--char` が algorithm に character を渡すことを確認
- Mandelbrot では `--char` が gradient ではなく single character を使う
- custom character output の tests を追加

**Verify:**

- `./fractals sierpinski --char '#'` uses '#'
- `./fractals mandelbrot --char '.'` uses '.'
- tests pass

---

### Task 8: Input Validation and Error Handling

invalid inputs の validation を追加する。

**Do:**

- Sierpinski: size > 0、depth >= 0
- Mandelbrot: width/height > 0、iterations > 0
- invalid inputs に clear error messages を返す
- error cases の tests を追加

**Verify:**

- `./fractals sierpinski --size 0` prints error, exits non-zero
- `./fractals mandelbrot --width -1` prints error, exits non-zero
- error messages are clear and helpful

---

### Task 9: Integration Tests

CLI を invoke する integration tests を追加する。

**Do:**

- `cmd/fractals/main_test.go` または `test/integration_test.go` を作成
- both commands の full CLI invocation を test
- output format と exit codes を検証
- error cases が non-zero exit を返すことを test

**Verify:**

- `go test ./...` passes all tests

---

### Task 10: README

usage と examples を文書化する。

**Do:**

- `README.md` を作成
  - project description
  - installation: `go install ./cmd/fractals`
  - usage examples
  - example output

**Verify:**

- README が tool を正確に説明する
- examples in README actually work
