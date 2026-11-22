---
title: A histogram with private bins
---

A histogram counts how many values fall into each group, called a bin. If every thread adds to one shared histogram, the threads must take turns with a lock on every single value. If each thread counts into its own bins instead, the loop needs no lock at all, and the bins are added together after the joins.

Write `parallel_histogram(a, n, workers, bins)`. Every value in `a` is a whole number from 0 to 9. When the function returns, `bins[v]` must hold how many of the `n` values are equal to `v`, for every `v` from 0 to 9. Use `workers` threads, between 1 and 8. Thread `w` handles the indexes from `w * n / workers` up to, but not including, `(w + 1) * n / workers`, and counts into its own 10 bins. Do not use a mutex.

You are done when Submit shows all three cases passing.

:::example
**Input:** `parallel_histogram(a, 6, 2, bins)`, where `a` is {3, 1, 3, 9, 0, 3}

**Output:** `bins[3]` is 3, `bins[0]`, `bins[1]`, and `bins[9]` are 1, and every other bin is 0
:::

:::hint
Declare `typedef struct { const int *a; int begin, end; long bins[10]; } Task;`. The worker sets its 10 bins to 0, then runs `t->bins[t->a[i]]++` over its range.
:::

:::hint
Before you start the threads, set all 10 of the caller's `bins` to 0. The caller's array may hold old values.
:::

:::hint
After joining thread `w`, add `tasks[w].bins[v]` to `bins[v]` for every `v` from 0 to 9.
:::

:::case name="small example"
Six values split between two threads.
:::

:::case name="old values cleared"
The caller's bins start with leftover numbers, which must not stay in the answer.
:::

:::case name="many values"
Ten thousand values counted by eight threads.
:::
