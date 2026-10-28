---
title: "Lab: time two ways to read a grid"
---

In the lesson "Why the machine matters" you read that the order you visit memory can change the speed, even when the work is the same. In this lab you measure it yourself, on your own computer.

## The idea, in short

A **grid** (a 2D array) is a table of numbers. A **row** is one horizontal line of the table: `grid[0][0]`, `grid[0][1]`, `grid[0][2]`, and so on. A **column** is one vertical line: `grid[0][0]`, `grid[1][0]`, `grid[2][0]`, and so on. In `grid[i][j]`, `i` is the row number and `j` is the column number.

Memory is one long line of bytes, so C stores the grid row by row: all of row 0, then all of row 1. That means:

- Moving along a row (`j` grows by 1) goes to the **neighbor** in memory, 4 bytes away.
- Moving down a column (`i` grows by 1) jumps over a **whole row**. Here a row has 4096 `int`s, so that is 4096 × 4 = 16 384 bytes away.

The processor never fetches just one number. It fetches a 64-byte block, a **cache line**, into a small fast memory called the **cache**. That is 16 `int`s at once. Reading row by row uses all 16 before fetching the next block. Reading column by column uses one and then jumps far away, so it keeps going back to slow memory.

## What is in the folder

- `stride.c`: a program that fills a 4096 × 4096 grid of `int`s (64 MB), adds up every number twice, times both, and prints the results. The two adding functions, `sum_rows` and `sum_cols`, are left for you. Each has a `TODO` comment and returns 0 for now.
- `Makefile`: a small recipe file for `make`. **make** is a tool that reads the recipe and runs the long `gcc` commands for you, so you only type a short command.

## What to do in VS Code

1. Download the zip below and unzip it. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
2. Open a terminal inside VS Code: **Terminal → New Terminal**. This lab needs `gcc` and `make`, which Linux and macOS have (on Windows, use WSL, the Linux system built into Windows).
3. Type `make test` and press Enter. It builds a small 1024 × 1024 grid and checks both sums. Right now it prints `WRONG`, because both functions return 0.
4. Open `stride.c` and write `sum_rows`: an outer loop over the rows `i`, an inner loop over the columns `j`, adding `grid[i][j]` to `total`. Then write `sum_cols` with the two loops the other way round: the outer loop over the columns `j`, the inner loop over the rows `i`.
5. Run `make test` again until it prints `OK: both sums are 1072693248.`
6. Type `make run`. This builds the full 4096 × 4096 grid with `-O2`, the option that asks the compiler to make the code fast, the way real programs are built. Then it runs the timing.

The two functions do exactly the same additions on exactly the same numbers. Only the order of the reads differs.

## What to write down

`make run` prints something like this (your numbers will differ):

```text
Grid: 4096 x 4096 ints (64 MB)
row by row:       sum = 68702699520, time = 0.0066 s
column by column: sum = 68702699520, time = 0.0687 s
OK: both sums are 68702699520.
Column by column took 10.3 times as long as row by row.
```

Run it three times, because times jump around a little. Write down:

1. the time for row by row,
2. the time for column by column,
3. how many times slower column by column was.

Then write **one sentence** that explains the difference, using the lesson's idea of reading memory in order. For example, it could start: "Row by row is faster because each read is the neighbor of the previous one, so…"

You are done when `make test` prints `OK`, and you have the three numbers and your sentence.
