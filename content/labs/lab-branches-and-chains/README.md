---
title: "Lab: branches, chains, and compiler options"
---

Two loops can do exactly the same work and still run at very different speeds. In this lab you time a branch on predictable and unpredictable data, write a sum with four running totals and time it against one, and see how much the compiler's optimization level changes. Then you optimize three small functions that use everything from the lecture. It needs a real machine, because the speed depends on your own processor.

## Get ready

1. Download the lab files with the button on this page, and unzip them.
2. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
3. Open a terminal inside VS Code: **Terminal → New Terminal**.
4. Check that you have `gcc`, the compiler, and `make`, a tool that runs the long `gcc` commands for you. To install them, type `xcode-select --install` on macOS, or `sudo apt install build-essential` on Linux or WSL (the Linux system built into Windows).

The folder holds:

- `bench.c`: the program for Part 1.
- `Makefile`: the recipe file that `make` reads.
- `final/` and `tests/`: the code for Part 2, a final exercise that uses everything from Lecture 4.

## Part 1: write four running totals

`bench.c` times two things.

- `update` writes a 9 wherever a flag is set, with an `if`. It runs on about a million flags in a random order, and then on the same flags sorted, with all the 0s first.
- `sum_one` adds up an array of `double`s with one running total. `sum_four` should do the same with four running totals, but it is empty.

1. Type `make test` and press Enter. It builds small inputs and checks `sum_four`. It prints `WRONG: sum_four gave 0`, and then make prints a line like `make: *** [test] Error 1`. That is expected, because `sum_four` does nothing yet.
2. Open `bench.c` and write `sum_four`. Use four totals `s0` to `s3` in a loop that steps by 4. After the loop, add the four totals together, and then add the 0 to 3 numbers that are left.
3. Run `make test` again until it prints `OK: both sums give the same answer.`

## Part 1: watch the differences

Type `make run`. It builds `bench.c` with `-O2` and prints the times:

```text
Branch: 1048576 flags, 80 passes, 524047 of them set
  random flags:   231.77 ms
  sorted flags:    11.49 ms
  random took 20.2 times as long as sorted.
Sum: 16384 doubles, 2000 passes
  one running total:      22.61 ms
  four running totals:     5.59 ms
OK: both sums give the same answer.
One total took 4.0 times as long as four.
```

The numbers above are only an example. Your computer will print different times. Usually the random flags are clearly slower than the sorted ones, and four totals are clearly faster than one.

If random and sorted take about the same time on your machine, the compiler may have replaced the jump with a conditional move, so there was nothing to guess. That is a fine result too: write it down.

### Try other optimization levels

Type `make run OPT=-O0`, then `make run OPT=-O1`, then `make run` again (which uses `-O2`). Each one rebuilds the same `bench.c` with a different level.

### Write down what you found

Write down:

1. the two branch times and the ratio, at `-O2`,
2. the two sum times and the ratio, at `-O2`,
3. the sum times at `-O0` and at `-O2`.

Then write **two sentences**. The first explains why random flags are slower, using the words "guess" and "pipeline". The second explains why four totals are faster, using the words "wait" and "independent".

Part 1 is done when `make test` prints `OK`, and you have the numbers and your two sentences.

### Going further (optional)

Write `sum_eight`, with eight running totals, and time it. Is it faster than four on your machine? At some point more totals stop helping, because the processor can only have so many additions in progress at once.

## Part 2: what you will build

You build three functions in `final/fast.c`, with nothing inside them yet. For each one, here is a simple but slow version. Yours must give the same results, and should be faster.

All three take pointers marked `restrict`: you may assume that the arrays never overlap.

**`dot4(a, b, n)`** returns the sum of `a[i] * b[i]` for every `i`. The slow version uses one running total:

```c
double sum = 0;
for (int i = 0; i < n; i++)
    sum += a[i] * b[i];
return sum;
```

Use four running totals, and do not forget the numbers that are left over.

**`smooth(rows, cols, img, out, t)`** works on an image of `rows` by `cols` pixels, stored row by row. For every pixel that is not on the border, if the pixel is greater than `t`, `out` gets the average of its four neighbors (above, below, left, right). Otherwise `out` gets the pixel itself. The border of `out` must not change. The slow version:

```c
for (int j = 1; j < cols - 1; j++)
    for (int i = 1; i < rows - 1; i++) {
        int p = i * cols + j;
        float avg = (img[p - cols] + img[p + cols] + img[p - 1] + img[p + 1]) * 0.25f;
        out[p] = (img[p] > t) ? avg : img[p];
    }
```

Find what makes it slow on a large image, and fix it.

**`update(a, b, out, n, limit)`** sets each `out[i]` and returns the sum of the squares of the outputs, its "energy". The slow version:

```c
double energy = 0;
for (int i = 0; i < n; i++) {
    if (a[i] > limit) {
        out[i] = a[i] * b[i] + 1.0f;
        energy += (double)out[i] * out[i];
    } else {
        out[i] = 0;
    }
}
return energy;
```

Find at least two improvements. Ideas: compute the value into a local variable first, so it is not read back from `out`. Choose the value with `? :`, so that both cases do the same simple work. Use more than one running total for the energy.

## Part 2: build and test it

1. Type `make final`. It builds your code and prints one line for each check: `OK` or `WRONG`, and the reason. Most say `WRONG` for now, and make ends with an error line. That is expected.
2. Write the functions in `final/fast.c`. Run `make final` after each one, and watch the `WRONG` lines disappear.
3. The energy is compared with a small tolerance, so adding it up in a different order is fine.

You are done with the whole lab when `make final` prints `OK: every final check passes.`

### What you practiced

| You wrote | What it practices |
| --- | --- |
| `sum_four` and `dot4` | Multiple accumulators and the tail loop |
| Your sentences about the times | Explaining speed with the pipeline and branch prediction |
| `smooth` | Loop order for memory, and a cheap conditional value |
| `update` | Local variables, conditional values, `restrict`, and several running totals |
| Running at `-O0`, `-O1`, and `-O2` | What the compiler does for you, and measuring it |
