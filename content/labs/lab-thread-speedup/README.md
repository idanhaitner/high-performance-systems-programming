---
title: "Lab: measure what threads gain"
---

Threads can make a program faster, or slower. In this lab you split the sum of a big array across 1, 2, 4, and 8 threads and measure the speedup, see what happens when the array is tiny, and time three ways for threads to share one counter. Then you write three threaded functions that use everything from the lecture. It needs a real machine, because the speedup depends on how many cores your own processor has.

## Get ready

1. Download the lab files with the button on this page, and unzip them.
2. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
3. Open a terminal inside VS Code: **Terminal → New Terminal**.
4. Check that you have `gcc`, the compiler, and `make`, a tool that runs the long `gcc` commands for you. To install them, type `xcode-select --install` on macOS, or `sudo apt install build-essential` on Linux or WSL (the Linux system built into Windows).

The folder holds:

- `bench.c`: the program for Part 1.
- `Makefile`: the recipe file that `make` reads. It adds `-pthread` to every `gcc` command for you.
- `final/` and `tests/`: the code for Part 2, a final exercise that uses everything from Lecture 5.

## Part 1: start the threads

`bench.c` already has a `Task` structure and a worker, `partial_sum`, that adds up the range `[begin, end)` of an array into its task's `sum` field. `parallel_sum(a, n, workers)` should start `workers` threads, one per range, wait for them, and return the total. It is empty.

1. Type `make test` and press Enter. It builds small inputs and checks `parallel_sum`. It prints a line that starts with `WRONG: parallel_sum gave 0`, and then make prints a line like `make: *** [test] Error 1`. That is expected, because `parallel_sum` does nothing yet.
2. Open `bench.c` and write `parallel_sum`. Use an array of `Task` and an array of `pthread_t`, both with room for `MAX_WORKERS`. Give thread `w` the range from `w * n / workers` to `(w + 1) * n / workers`. Start all the threads in one loop, then join them in a second loop, and add each task's `sum` only after its join.
3. Run `make test` again until it prints `OK: parallel_sum gives the right answer for every number of threads.`

## Part 1: watch the numbers

Type `make run`. It builds `bench.c` with `-O2` and prints the times. Here is one run on a laptop with 8 cores:

```text
Sum of 16777216 ints, 10 passes:
  1 thread(s):    16.280 ms   speedup  1.00   efficiency  100%
  2 thread(s):     9.895 ms   speedup  1.65   efficiency   82%
  4 thread(s):     9.748 ms   speedup  1.67   efficiency   42%
  8 thread(s):     8.101 ms   speedup  2.01   efficiency   25%
Sum of 1000 ints, 10 passes:
  1 thread(s):     0.139 ms   speedup  1.00   efficiency  100%
  2 thread(s):     0.273 ms   speedup  0.51   efficiency   25%
  4 thread(s):     0.527 ms   speedup  0.26   efficiency    7%
  8 thread(s):     0.784 ms   speedup  0.18   efficiency    2%
OK: parallel_sum gives the right answer for every number of threads.
Shared counter, 4 threads, 1000000 increments each:
  lock on every increment:     64.643 ms   total 4000000
  count locally, lock once:     0.036 ms   total 4000000
  atomic on every increment:   22.249 ms   total 4000000
OK: all three counters reach 4000000.
```

Your computer will print different times. A few things to notice in this run:

- The big sum got faster with 2 threads, but then hardly improved, even with 8 threads on 8 cores. Adding numbers is so quick that the threads spend most of their time waiting for the array to arrive from memory, and all the cores share the same path to memory. More cores cannot make that path faster.
- The tiny sum got **slower** with every thread added, because creating and joining a thread costs far more than adding 1,000 numbers.
- Counting locally and locking once was by far the fastest counter. With `-O2` the compiler even turned the local loop into a single addition. Locking on every increment was the slowest, and atomics were in between.

To see how many cores your machine has, type `sysctl -n hw.ncpu` on macOS, or `nproc` on Linux and WSL.

### Write down what you found

Write down:

1. the number of cores on your machine,
2. the speedup and efficiency of the big sum with 2, 4, and 8 threads,
3. the speedup of the tiny sum with 8 threads,
4. the three counter times.

Then write **three sentences**. The first explains why the tiny sum gets slower with more threads, using the words "create" and "work". The second explains why the speedup of the big sum stops growing, using the words "cores" and "memory". The third explains why locking on every increment is slow, using the words "wait" and "lock".

Part 1 is done when `make test` prints `OK`, and you have the numbers and your three sentences.

### Going further (optional)

- Type `make tsan`. It builds the small version with ThreadSanitizer, a checker that reports two threads using the same memory without taking turns. Your `parallel_sum` should give no warning. Then, in `count_then_lock_once`, move `counter += local;` out from between the lock and the unlock, and run `make tsan` again. It should now print `WARNING: ThreadSanitizer: data race`. Put the line back afterwards. On Linux, if `make tsan` cannot find the sanitizer library, skip this step.
- Change `MAX_WORKERS` to 16 and the loop in `main` will also try 16 threads. Does it ever help on your machine?

## Part 2: what you will build

You build three functions in `final/par.c`, which have nothing inside them yet. Each one must give the same answer as the simple one-thread version shown, using `workers` threads, between 1 and `PAR_MAX_WORKERS` (8). Some threads may get an empty range when `n` is small.

**`par_dot(a, b, n, workers)`** returns the sum of `a[i] * b[i]` for every `i`, as a `long long`. The one-thread version:

```c
long long s = 0;
for (int i = 0; i < n; i++)
    s += (long long)a[i] * b[i];
return s;
```

Split the indexes into ranges, give each thread its own field for its partial sum, and add them up after the joins.

**`par_max(a, n, workers)`** returns the largest value in `a`. `n` is at least 1. The one-thread version:

```c
int m = a[0];
for (int i = 1; i < n; i++)
    if (a[i] > m)
        m = a[i];
return m;
```

Each thread finds the largest value in its own range. Careful: a thread whose range is empty has no largest value, so it must not read `a[begin]`, and its answer must be ignored. The values can all be negative, so do not start from 0.

**`par_count_above(a, n, workers, chunk, limit)`** returns how many values of `a` are greater than `limit`. This time, do not give out ranges in advance. Cut the array into **chunks** of `chunk` elements, numbered 0, 1, 2, and so on, where the last chunk may be shorter. Each thread takes the next chunk number with `atomic_fetch_add` on a shared `atomic_int`, counts that chunk, and takes another, until a chunk would start at or after `n`. Each thread counts in a local variable, and adds its count to a shared total **once**, at the end, with one `atomic_fetch_add`.

Put the shared values, such as the next chunk number and the total, in one structure, and pass all the threads a pointer to it. Set atomic fields in a structure with `atomic_init(&job.total, 0);`.

## Part 2: build and test it

1. Type `make final`. It builds your code and prints one line for each check: `OK` or `WRONG`, and the reason. They all say `WRONG` for now, and make ends with an error line. That is expected.
2. Write the functions in `final/par.c`. Run `make final` after each one, and watch the `WRONG` lines disappear.

You are done with the whole lab when `make final` prints `OK: every final check passes.`

### What you practiced

| You wrote | What it practices |
| --- | --- |
| `parallel_sum` and `par_dot` | Creating and joining threads, ranges, one result per task, combining after the join |
| Your sentences about the times | Speedup, efficiency, the cost of starting threads, and the cost of a lock |
| `par_max` | Empty ranges, and combining results that are not sums |
| `par_count_above` | Handing out work with an atomic counter, and counting locally before one shared update |
