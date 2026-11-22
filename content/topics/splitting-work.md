---
id: splitting-work
title: Splitting work across threads
sources:
  - "Lecture 5 - Pthreads in C.pdf"
  - "Tutorial5.pdf"
---

You can now start threads, give each one its own input, and read a result after the join. This lesson puts those pieces together to do real work faster: split an array into parts, let each thread handle one part, and combine the answers at the end.

## Cut the array into ranges

Say you must add up an array of `n` numbers with 4 threads. Cut the array into 4 pieces, one after the other, and give each thread one piece:

![An array of n elements cut into four equal ranges. Thread 0 gets elements 0 up to n/4, thread 1 from n/4 up to 2n/4, thread 2 from 2n/4 up to 3n/4, and thread 3 from 3n/4 up to n.](../assets/figures/partition.svg)

Each piece is a **range** of indexes, written `[begin, end)`. The square bracket means `begin` is included, and the round one means `end` is not. So `[0, 3)` is the indexes 0, 1, and 2. Every element belongs to **exactly one** thread, so no element is skipped and none is added twice.

With `W` threads, thread `w` (counting from 0) can get:

```c
size_t begin = w * n / W;
size_t end   = (w + 1) * n / W;
```

Try it with `n = 10` and `W = 4`. The boundaries are 10 × 0 / 4 = 0, then 10 / 4 = 2, then 20 / 4 = 5, then 30 / 4 = 7, then 40 / 4 = 10, because integer division drops the remainder. So the ranges are `[0, 2)`, `[2, 5)`, `[5, 7)`, and `[7, 10)`: sizes 2, 3, 2, and 3. They meet with no gap and no overlap, and they cover all 10 elements.

Other splits work too, as long as they cover every index exactly once. For example `[0, 3)`, `[3, 6)`, `[6, 8)`, `[8, 10)` gives the leftover elements to the first threads.

Keep the pieces about the same size. The job is done only when the **slowest** thread is done. If one thread gets twice as much as the others, everyone else sits idle while it finishes.

:::check id=chk-partition-ranges
An array has 6 elements and 4 threads. Thread `w` gets `[w * 6 / 4, (w + 1) * 6 / 4)` with integer division. Which range does thread 2 get?

- [ ] `[2, 3)`
- [x] `[3, 4)`
- [ ] `[4, 6)`

`2 * 6 / 4` is 12 / 4 = 3, and `3 * 6 / 4` is 18 / 4 = 4 after dropping the remainder. So thread 2 gets the one index 3.
:::

## One task structure per thread

Each thread needs to know its piece, and needs a place to put its answer. Put both in one structure, called a **task**:

```c
typedef struct {
    const int *a;      /* the whole array, only read */
    size_t begin;      /* first index of this thread's piece */
    size_t end;        /* one past the last index */
    long long sum;     /* this thread's answer */
} Task;

void *partial_sum(void *arg) {
    Task *t = arg;
    t->sum = 0;
    for (size_t i = t->begin; i < t->end; i++)
        t->sum += t->a[i];
    return NULL;
}
```

- All threads share the array `a`, but they only **read** it, which is safe.
- Each thread writes only **its own** `sum` field, so no two threads ever write the same memory.
- The sum is a `long long`, a wider integer type, so that adding many `int`s does not overflow.

## Combine after the join

`main` fills one task per thread, starts all threads, then joins them and adds up the partial sums:

```c
Task tasks[4];
pthread_t threads[4];

for (int w = 0; w < 4; w++) {
    tasks[w].a = a;
    tasks[w].begin = w * n / 4;
    tasks[w].end = (w + 1) * n / 4;
    pthread_create(&threads[w], NULL, partial_sum, &tasks[w]);
}

long long total = 0;
for (int w = 0; w < 4; w++) {
    pthread_join(threads[w], NULL);
    total += tasks[w].sum;
}
```

The important line is the order inside the second loop: **join first, then read**. Only after `pthread_join(threads[w], NULL)` returns is `tasks[w].sum` finished. Reading it earlier could give a half-done total, or 0.

:::check id=chk-read-before-join
`main` starts 4 threads that each fill `tasks[w].sum`, then immediately adds up the four sums, and only after that joins the threads. What can go wrong?

- [x] Some threads may not have finished, so `main` adds up sums that are still incomplete
- [ ] Nothing, because the threads were started before the addition
- [ ] The program will not compile

A thread's result is ready only once its join has returned. Starting a thread says nothing about when it finishes.
:::

## The same pattern for other jobs

The pattern is always the same: split the input, give each thread its own place for the output, combine after the join. For example, to find the largest number in an array, each thread finds the largest in its own range:

```c
void *partial_max(void *arg) {
    Task *t = arg;
    int m = t->a[t->begin];
    for (size_t i = t->begin + 1; i < t->end; i++)
        if (t->a[i] > m)
            m = t->a[i];
    t->max = m;
    return NULL;
}
```

Here `Task` has an `int max` field in place of `sum`. `main` then takes the largest of the per-thread maximums. This version assumes every range has at least one element, because it starts from `t->a[t->begin]`.

## Who writes what

When you split work, ask one question about every piece of memory: **who writes it, and when?** Here is the answer for a program that turns `n` input records into `n` results, one range of records per thread:

| Memory | Who writes it | Why it is safe |
| --- | --- | --- |
| The input `records[]` | `main`, before creating the threads | The threads only read it |
| `results[i]` | Only the thread whose range holds `i` | The ranges do not overlap |
| `tasks[w]` | `main` before the create, then thread `w` | Each thread has its own task |
| A total of all threads | `main`, after the joins | Every thread has finished |

If every row of this table has a clear answer, the threads never write the same memory at the same time, and the program needs no extra protection. When some memory has no clear owner, for example one counter that every thread adds to, you have a problem. That problem is the topic of the next lesson.

:::problem id=prac-split-ten title="Splitting ten records" source="Tutorial5.pdf" kind=exercise solution_origin=derived
10 records are split among 4 workers with `begin = w * 10 / 4` and `end = (w + 1) * 10 / 4`, using integer division.

:::check id=prac-split-ten-q1
Worker 1 handles the range {{=[2, 5)|[3, 6)|[2, 4)}}.

`1 * 10 / 4` is 2, and `2 * 10 / 4` is 5.
:::

:::check id=prac-split-ten-q2
The number of records that two workers both handle is {{=0|1|2}}.

Each range ends exactly where the next begins, so no record is in two ranges.
:::

:::check id=prac-split-ten-q3
If each record takes the same time, the job is finished when {{=the worker with the most records is done|the first worker is done|worker 0 is done}}.

The slowest worker decides when the whole job is done. Here two workers have 3 records and two have 2.
:::
:::

**Next:** what goes wrong when two threads change the same variable, and why it is so hard to notice.
