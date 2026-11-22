---
title: Add up an array with several threads
---

To split a job across threads, cut the array into ranges that do not overlap, let each thread add up its own range into its own field, and add the partial sums together only after each thread has been joined.

Write `parallel_sum(a, n, workers)`. It returns the sum of the `n` numbers of `a`, using `workers` threads, between 1 and 8. Thread `w` adds up the indexes from `w * n / workers` up to, but not including, `(w + 1) * n / workers`. Some ranges can be empty, and `n` can be 0.

You are done when Submit shows all four cases passing.

:::example
**Input:** `parallel_sum(a, 10, 4)`, where `a` is {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

**Output:** 55. The ranges are [0, 2), [2, 5), [5, 7), and [7, 10), with sums 3, 12, 13, and 27.
:::

:::example
**Input:** `parallel_sum(a, 3, 8)`, where `a` is {5, 5, 5}

**Output:** 15, where five of the eight threads get an empty range
:::

:::hint
Declare `typedef struct { const int *a; int begin, end; long long sum; } Task;` and a worker that sets `t->sum = 0` and adds `t->a[i]` for `i` from `t->begin` to `t->end - 1`.
:::

:::hint
In `parallel_sum`, fill `tasks[w]` with `begin = w * n / workers` and `end = (w + 1) * n / workers`, and create thread `w` with `&tasks[w]`.
:::

:::hint
In a second loop, join thread `w` first, then add `tasks[w].sum` to the total. Return the total.
:::

:::case name="ten numbers, four threads"
The ranges have sizes 2, 3, 2, and 3.
:::

:::case name="one thread"
With one thread, it adds up the whole array.
:::

:::case name="more threads than numbers"
Threads with an empty range add nothing.
:::

:::case name="big sum"
The total does not fit in an int, so it must be added up as a long long.
:::
