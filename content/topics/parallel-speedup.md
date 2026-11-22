---
id: parallel-speedup
title: "Speedup, and a parallel program from start to end"
sources:
  - "Lecture 5 - Pthreads in C.pdf"
  - "Tutorial5.pdf"
---

You now have every tool of this lecture: threads, arguments, split work, mutexes, and atomics. This last lesson asks the question that matters most in this course: **did it get faster?** It shows how to measure the gain, why more threads can make a program slower, and then follows one parallel program from a working one-thread version to a correct and measured many-thread version.

## Speedup and efficiency

Time the same job twice: once with one thread, and once with `p` threads. Call the times `T(1)` and `T(p)`.

The **speedup** says how many times faster the threaded version is:

```text
S(p) = T(1) / T(p)
```

The **efficiency** says how much of the ideal you got. With `p` threads, the best you can hope for is a speedup of `p`:

```text
E(p) = S(p) / p
```

A worked example. One thread takes 12 seconds, and 4 threads take 4 seconds.

- Speedup: S(4) = 12 / 4 = **3**. The program is 3 times faster.
- Efficiency: E(4) = 3 / 4 = **75%**. Four threads did the work of three.

A speedup below 1 means the threaded version is **slower** than one thread.

:::definition id=def-speedup title="Speedup" source="Lecture 5 - Pthreads in C.pdf"
The **speedup** of a program on `p` threads is `S(p) = T(1) / T(p)`, the time on one thread divided by the time on `p` threads. Its **efficiency** is `E(p) = S(p) / p`, which is 100% when `p` threads make it exactly `p` times faster.
:::

:::check id=chk-speedup-calc
A job takes 20 seconds on 1 thread and 8 seconds on 4 threads. What are the speedup and the efficiency?

- [ ] Speedup 4, efficiency 100%
- [x] Speedup 2.5, efficiency 62.5%
- [ ] Speedup 12, efficiency 300%

Speedup is 20 / 8 = 2.5. Efficiency is 2.5 / 4 = 0.625, or 62.5%.
:::

## Measuring it fairly

The rules from Lecture 4 still hold, with a few more for threads:

- Time **the same work on the same input** in both versions.
- Run each version several times and compare typical values, such as the median, not one lucky run.
- Leave setup, such as filling the input array, out of the timing only when the question you are asking really excludes it.
- **Check the answer.** Print or test the result, both so that the compiler cannot throw away work whose result is never used, and because a fast wrong answer is worthless.

## Why more threads can be slower

| Cause | What happens |
| --- | --- |
| Starting threads costs time | Creating and joining a thread takes far longer than adding a few numbers |
| Waiting for locks | If every thread needs the same lock, they mostly take turns |
| Uneven pieces | Threads that finish early sit idle while the slowest one works |
| Limits of the machine | You cannot gain more than the number of free cores, and many threads reading memory at once can use up the memory's speed |

So choose the number of threads by measuring, not by habit.

Here are real numbers for one job, processing `n` records with 2 threads, measured on a virtual machine with 2 cores:

| Records | One thread | Two threads | Create and join alone | Speedup |
| --- | --- | --- | --- | --- |
| 64 | 0.0003 ms | 0.029 ms | 0.028 ms | 0.01 |
| 65,536 | 0.191 ms | 0.187 ms | 0.061 ms | 1.02 |
| 1,048,576 | 4.03 ms | 2.45 ms | 0.105 ms | 1.65 |

- With **64 records**, the real work takes 0.0003 ms, but creating and joining two threads takes about 0.028 ms. The threaded version is about **100 times slower**.
- With **65,536 records**, the work and the thread overhead roughly cancel out, and there is almost no gain.
- Only with **a million records** is there enough work to pay for the threads, and the speedup reaches 1.65.

Even then it is below the ideal of 2. Part of the time goes to starting threads, and part to things the cores share, such as the path to memory.

:::check id=chk-tiny-job
Adding up 100 numbers takes 0.0001 ms on one thread. Creating and joining 4 threads takes about 0.05 ms. What will 4 threads do to the total time?

- [x] Make it much slower, because starting the threads costs far more than the work itself
- [ ] Make it about 4 times faster
- [ ] Leave it about the same

The work is tiny compared to the cost of the threads. Threads pay off only when each one gets enough work to hide the cost of starting it.
:::

## A parallel program from start to end

Here is a complete example of the method, step by step. The job: there are `n` records, each with an `id` and a `value`. A ready-made function computes a score for each record. For every record, the program allocates a small result from an **arena**, the bump allocator from Lecture 3, and stores the score in it:

```c
typedef struct { uint32_t id; int32_t value; } Record;
typedef struct { uint32_t id; int64_t score; } Result;   /* 16 bytes */
```

### Step 1: a correct one-thread version first

```c
Arena arena;
arena_init(&arena, backing, ARENA_SIZE);

for (size_t i = 0; i < n; ++i)
    results[i] = make_result(&arena, &records[i]);
```

`make_result` calls `arena_alloc` for a new `Result` and fills it in. One thread, one arena, nothing shared. This version is the reference. It also prints a **checksum**, a single number computed from all the results, so that any later version can be compared with it.

### Step 2: split the records

Each worker gets a context structure with its range and pointers to the shared arrays:

```c
typedef struct {
    Range range;              /* begin and end of this worker's records */
    const Record *records;    /* shared, only read */
    Result **results;         /* each worker writes only its own range */
    Arena *arena;             /* where this worker allocates */
    size_t processed;
    int status;
} ThreadContext;

void *worker(void *arg) {
    ThreadContext *ctx = arg;
    for (size_t i = ctx->range.begin; i < ctx->range.end; ++i)
        ctx->results[i] = make_result(ctx->arena, &ctx->records[i]);
    return NULL;
}
```

The loop is the one-thread loop, limited to one range. `main` creates all the workers, then joins them all.

### Step 3: the first attempt has a race

The first version set every worker's `arena` to the **same** arena:

```c
ctx[w].arena = &shared;    /* every worker: same arena */
```

All four workers now call `arena_alloc` on one shared `next_offset`. As the lesson on race conditions showed, two workers can read the same offset and receive the same 16 bytes. The program passed in 1,954 of 2,000 runs and failed in 46, and ThreadSanitizer reported the race on every run it watched.

### Step 4: give each worker its own arena

The fix changes **who owns** the memory, not the worker code. A ready-made function, `arena_split`, cuts the backing memory into separate, non-overlapping parts and sets up one arena in each:

```c
Arena arenas[MAX_WORKERS];
arena_split(arenas, workers, backing, ARENA_SIZE);

ctx[w].arena = &arenas[w];    /* each worker: its own arena */
```

Neither `worker` nor `make_result` changed at all. Each arena's `next_offset` now has exactly one writer, so there is nothing to race on, and no lock is needed.

### Step 5: check, then measure

The new version printed checksum `20469476`, the same as the one-thread version. ThreadSanitizer was clean on 50 out of 50 runs. Only after that is it worth timing it.

One more thing to check: splitting the memory also splits its **size**. With 4,096 bytes cut into 4 arenas of 1,024 bytes, each arena holds 1,024 / 16 = 64 results. With 257 records, worker 0 gets 65 of them and runs out of memory, even though the four arenas together have room for 256 results. Owning the memory removed the race, but each part must now be big enough for the worker's own share.

:::trap
A fast result counts only if it is also correct. Compare every parallel version with the one-thread version before you time it.
:::

:::problem id=prac-measure-threads title="Reading a parallel benchmark" source="Tutorial5.pdf" kind=exercise solution_origin=source
A program processes records with 2 threads. For 1,048,576 records, one thread takes 4.03 ms and two threads take 2.45 ms. For 64 records, one thread takes 0.0003 ms and two threads take 0.029 ms.

:::check id=prac-measure-threads-q1
The speedup for 1,048,576 records is about {{=1.65|2|0.61}}.

4.03 / 2.45 is about 1.65.
:::

:::check id=prac-measure-threads-q2
The efficiency for 1,048,576 records is about {{=82%|165%|50%}}.

1.65 / 2 is about 0.82.
:::

:::check id=prac-measure-threads-q3
For 64 records, the threaded version is slower because {{=creating and joining the threads costs far more than the work itself|the records do not fit in the arena|two threads always race}}.

The work takes 0.0003 ms, while the threads alone take about 0.028 ms.
:::
:::

## What comes next

Threads share memory, and in this lecture that sharing was something you managed with ranges, locks, and atomics. But each core also keeps its own copies of memory in its own cache. The next lecture asks what the hardware must do to keep those copies in agreement when threads share data, and why two threads that never touch the same variable can still slow each other down.

**Next:** the practice for this lecture has questions and coding exercises with real threads, and a lab where you measure the speedup on your own computer.
