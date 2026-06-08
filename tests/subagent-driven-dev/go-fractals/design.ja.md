# Go Fractals CLI - 設計

## 概要

ASCII art の fractals を生成する command-line tool。2 種類の fractal type と configurable output をサポートする。

## 使い方

```bash
# Sierpinski triangle
fractals sierpinski --size 32 --depth 5

# Mandelbrot set
fractals mandelbrot --width 80 --height 24 --iterations 100

# Custom character
fractals sierpinski --size 16 --char '#'

# Help
fractals --help
fractals sierpinski --help
```

## Commands

### `sierpinski`

recursive subdivision で Sierpinski triangle を生成する。

Flags:

- `--size` (default: 32) - triangle base の幅を文字数で指定
- `--depth` (default: 5) - recursion depth
- `--char` (default: '*') - filled points に使う文字

Output: triangle を stdout に出力。1 row につき 1 line。

### `mandelbrot`

Mandelbrot set を ASCII art として render する。iteration count を character に map する。

Flags:

- `--width` (default: 80) - output width
- `--height` (default: 24) - output height
- `--iterations` (default: 100) - escape calculation の maximum iterations
- `--char` (default: gradient) - single character。省略時は gradient `" .:-=+*#%@"`

Output: rectangle を stdout に出力。

## Architecture

```text
cmd/
  fractals/
    main.go           # entry point, CLI setup
internal/
  sierpinski/
    sierpinski.go     # algorithm
    sierpinski_test.go
  mandelbrot/
    mandelbrot.go     # algorithm
    mandelbrot_test.go
  cli/
    root.go           # root command, help
    sierpinski.go     # Sierpinski subcommand
    mandelbrot.go     # Mandelbrot subcommand
```

## Dependencies

- Go 1.21+
- CLI 用に `github.com/spf13/cobra`

## Acceptance Criteria

1. `fractals --help` が usage を表示する
2. `fractals sierpinski` が recognizable triangle を出力する
3. `fractals mandelbrot` が recognizable Mandelbrot set を出力する
4. `--size`, `--width`, `--height`, `--depth`, `--iterations` flags が動く
5. `--char` で output character を customize できる
6. invalid inputs は clear error messages を出す
7. all tests pass
