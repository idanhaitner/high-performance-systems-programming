---
title: "Lab: how much does the access pattern matter?"
---

Matrix multiplication does the same arithmetic in every loop order, but the order decides how well the program uses the cache. In this lab you write the cache-friendly order, time it against the natural one on your own computer, and then build a small toolkit that uses everything from the lecture: layout, alignment, cache lines, and blocking. It needs a real machine, because the speed depends on your own processor.

## Get ready

1. Download the lab files with the button on this page, and unzip them.
2. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
3. Open a terminal inside VS Code: **Terminal → New Terminal**.
4. Check that you have `gcc`, the compiler, and `make`, a tool that runs the long `gcc` commands for you. To install them, type `xcode-select --install` on macOS, or `sudo apt install build-essential` on Linux or WSL (the Linux system built into Windows).

The folder holds:

- `matmul.c`: the program for Part 1.
- `Makefile`: the recipe file that `make` reads.
- `final/` and `tests/`: the code for Part 2, a final exercise that uses everything from Lecture 3.

## Part 1: write the cache-friendly order

`matmul.c` multiplies two 512 by 512 matrices of `double`s, `A` and `B`, into `C`. It does this twice and times each one. `multiply_ijk` is the natural order, and it is already written. `multiply_ikj` is empty.

1. Type `make test` and press Enter. It builds small matrices and checks both orders. It prints `WRONG: i-k-j gave a checksum of 0`, and then make prints a line like `make: *** [test] Error 1`. That is expected, because `multiply_ikj` does nothing yet.
2. Open `matmul.c` and write `multiply_ikj`. It has the same result as `multiply_ijk`, but the three loops go in the order `i`, then `k`, then `j`. Read `A[i][k]` once into a variable before the inner loop. `C` has just been cleared, so you can add to it with `+=`.
3. Run `make test` again until it prints `OK: both orders give the same answer.`

## Part 1: watch the difference

Type `make run`. It multiplies the 512 by 512 matrices both ways and prints the times:

```text
Matrices: 512 x 512 doubles (2 MB each)
i-j-k: time = 0.1544 s
i-k-j: time = 0.0279 s
OK: both orders give the same answer.
i-j-k took 5.5 times as long as i-k-j.
```

The numbers above are only an example. Your computer will print different times, but i-j-k should be clearly slower. Both orders do exactly the same 512 × 512 × 512 multiplications. Only the order of the memory reads changed.

### Try bigger matrices

Type `make run N=1024`. The matrices are four times bigger, and the gap usually grows, because the columns of `B` no longer fit in the cache.

### Write down what you found

Write down:

1. the two times for the 512 by 512 matrices, and how many times slower i-j-k was,
2. which array, `A`, `B`, or `C`, the inner loop of i-j-k reads with a big stride.

Then write **one sentence** that explains the difference, using cache lines. It could start: "The i-k-j order was faster because…"

Part 1 is done when `make test` prints `OK`, and you have the numbers and your sentence.

### Going further (optional)

Write a third function that multiplies the matrices with **blocking**: cut the three loops into tiles of `BS` by `BS`, as in the lesson. Call it from `main` and time it. Try `BS` values of 8, 16, 32, and 64. Which one is the fastest on your machine? Compare it with the size of your processor's L1 cache.

## Part 2: what you will build

You build four small functions that turn the ideas of the lecture into code. They are in `final/blocks.c`, with nothing inside them yet.

- `round_up(offset, align)` returns the smallest multiple of `align` that is at least `offset`.
- `struct_size(sizes, count)` is your own `sizeof` for a structure. The array `sizes` holds the sizes of the `count` members, in the order they are declared. Each member must start at a multiple of its own size, and the total must be rounded up to a multiple of the biggest member. It uses `round_up`.
- `lines_touched(addr, bytes)` returns how many 64-byte cache lines are touched by `bytes` bytes that start at address `addr`.
- `transpose_blocked(n, bs, in, out)` turns the rows of the `n` by `n` matrix `in` into columns, and puts the result in `out`. Both matrices are stored row by row, so `out[j * n + i]` must become `in[i * n + j]`. Work in tiles of `bs` by `bs`, and make the last tiles smaller if `n` is not a multiple of `bs`.

### Why a transpose?

A transpose has to read along rows and write along columns, so one of the two always has a big stride. Working one small tile at a time keeps both the tile you read and the tile you write in the cache.

## Part 2: build and test it

1. Type `make final`. It builds your code and prints one line for each check: `OK` or `WRONG`, and the reason. All say `WRONG` for now, and make ends with an error line. That is expected.
2. Write the functions in `final/blocks.c`, from the top. `struct_size` uses `round_up`, so start there. Run `make final` after each function, and watch the `WRONG` lines disappear.
3. The test compares `struct_size` with the real `sizeof` of four structures. If your answer is different, work through the offsets by hand, as you did in the lesson.

You are done with the whole lab when `make final` prints `OK: every final check passes.`

### What you practiced

| You wrote | What it practices |
| --- | --- |
| `multiply_ikj` | Loop interchange, and reading a value once to reuse it |
| `struct_size` and `round_up` | Alignment, padding, and tail padding |
| `lines_touched` | Counting cache lines instead of loads |
| `transpose_blocked` | Blocking, row-major order, and tiles at the edge |
| Your sentence about the cache | Explaining speed with cache lines |
