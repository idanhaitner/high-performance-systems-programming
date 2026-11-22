---
title: One thread for each number
---

A thread gets its input through one pointer. When several threads start in a loop, each one needs its own object to point to, one that stays alive until the thread has been joined.

Write `squares(in, out, n)`. It starts `n` threads, one for each number, where `n` is between 1 and 8. Thread `i` computes `in[i] * in[i]` and stores it in `out[i]`. Give each thread its own structure that holds its input and a place for its answer. Start all `n` threads first, then join all of them, then copy the answers into `out`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `squares(in, out, 4)`, where `in` is {1, 2, 3, 4}

**Output:** `out` is {1, 4, 9, 16}
:::

:::example
**Input:** `squares(in, out, 1)`, where `in` is {-7}

**Output:** `out` is {49}
:::

:::hint
Declare `typedef struct { int x; int square; } Job;` and a worker `void *square_job(void *arg)` that sets `j->square = j->x * j->x;` through `Job *j = arg;`.
:::

:::hint
In `squares`, declare `Job jobs[8];` and `pthread_t threads[8];`. In a first loop, set `jobs[i].x = in[i]` and call `pthread_create(&threads[i], NULL, square_job, &jobs[i]);`.
:::

:::hint
In a second loop, call `pthread_join(threads[i], NULL);` and then `out[i] = jobs[i].square;`.
:::

:::case name="four numbers"
1, 2, 3, and 4 become 1, 4, 9, and 16.
:::

:::case name="one number"
With one number, there is one thread. A negative number gives a positive square.
:::

:::case name="eight numbers"
Eight threads at once, each with its own input.
:::
