---
id: race-conditions
title: "Race conditions: when threads share a variable"
sources:
  - "Lecture 5 - Pthreads in C.pdf"
  - "Tutorial5.pdf"
---

In the previous lesson every thread wrote only its own memory, and that was safe. This lesson shows what happens when two threads change the **same** variable: the result comes out wrong, and differently wrong on each run. You will see exactly why, and how to find such bugs.

## Two threads, one counter

Here two threads each add 1 to a global counter a million times:

```c
long counter = 0;

void *worker(void *arg) {
    for (long i = 0; i < 1000000; i++)
        counter++;
    return NULL;
}
```

`main` starts two workers, joins both, and prints `counter`. It should print 2,000,000. One run printed **1,376,492**. Running it again prints yet another number. Some of the additions simply disappeared.

## `counter++` is three steps, not one

The line `counter++` looks like one action, but the processor does it in three steps:

1. **Read** the value of `counter` from memory into a register.
2. **Add** 1 to the register.
3. **Write** the register back to `counter` in memory.

This is called a **read-modify-write**. Another thread can run between any two of the steps. Watch what happens when both threads read before either one writes:

![A table of four steps. Step 1: thread A reads 10. Step 2: thread B reads 10. Step 3: thread A writes 11. Step 4: thread B writes 11. The counter ends at 11 although two increments ran.](../assets/figures/lost-update.svg)

Two increments ran, but the counter grew by only one. Thread B's write replaced thread A's, because B had read the old value. This is called a **lost update**. In the run that printed 1,376,492, over 600,000 increments were lost this way.

:::check id=chk-lost-update
`counter` is 5. Two threads each run `counter++` once, at the same time. Which final values are possible?

- [ ] Only 7
- [x] 6 or 7
- [ ] 5, 6, or 7

If one thread finishes its read, add, and write before the other reads, the result is 7. If both read 5 before either writes, both write 6. It cannot stay 5, because at least one write of 6 happens.
:::

## Race conditions and critical sections

A **race condition** is a bug where the result depends on the exact timing of the threads: who reads and writes first. The program "races", and the outcome depends on who wins.

The piece of code that touches the shared data, here the single line `counter++`, is called a **critical section**. While one thread is inside it, no other thread may be inside it at the same time.

:::definition id=def-race-condition title="Race condition" source="Lecture 5 - Pthreads in C.pdf"
A **race condition** is an error whose result depends on the timing of threads. It happens when at least two threads use the same memory at the same time, at least one of them writes, and nothing makes them take turns. In C this is called a **data race**, and a program with a data race has undefined behavior: the compiler may assume it never happens, so anything can come out.
:::

:::definition id=def-critical-section title="Critical section" source="Lecture 5 - Pthreads in C.pdf"
A **critical section** is a piece of code that uses shared data and must not be run by two threads at the same time.
:::

Notice what is **not** a race: many threads reading the same array, with nobody writing it. That is perfectly safe, and the summing threads in the previous lesson did exactly that.

:::check id=chk-is-it-a-race
Which of these has a race condition?

- [ ] Four threads each read every element of a shared array, and nobody writes it
- [ ] Four threads each write only their own element `out[w]` of a shared array
- [x] Four threads each add to the same global variable `total`, with no lock

Reading shared data is safe, and so is writing separate elements. Writing the same variable from several threads, with nothing to make them take turns, is a race.
:::

## A race hidden inside a function

Races are not always as easy to see as `counter++`. Recall the bump allocator from Lecture 3: an **arena** is one big block of memory, and `arena_alloc` hands out pieces of it by moving a counter called `next_offset` forward. In simplified form:

```c
void *arena_alloc(Arena *a, size_t size) {
    size_t start = a->next_offset;      /* read */
    if (start + size > a->capacity)
        return NULL;
    a->next_offset = start + size;      /* write */
    return a->base + start;
}
```

This is a read-modify-write too. Now let 4 worker threads, each processing its own range of records, share **one** arena and call `arena_alloc` for every result.

Suppose `next_offset` is 48, and two threads each ask for 16 bytes at the same moment. Both read 48. Both write 64. Both get back the address `base + 48`. Two different results are now stored in the **same** 16 bytes, and one overwrites the other.

Nothing about this is visible in the worker function. Each worker handles only its own records, and the code looks safe. The race is inside a function it calls, on a variable every worker reaches through the same pointer.

## Why tests do not catch races

This exact program was run 2,000 times. It passed its checks in 1,954 runs and failed in 46. A program that passes most of the time is not correct. It only means the bad timing is rare on that machine, and it may be more common on another machine, or under a heavier load.

:::trap
A program with a race can pass its tests many times in a row. Passing tests do not prove that threaded code is correct.
:::

There is a tool made for this. **ThreadSanitizer** watches every memory access while the program runs and reports two threads that use the same memory without taking turns. You turn it on with a compiler option:

```bash
gcc -g -fsanitize=thread race.c -o race -pthread
./race
```

On the shared-arena program it printed `WARNING: ThreadSanitizer: data race`, with the line where one thread read `next_offset` and the line where another thread wrote it. It reports the race even in runs where the answer happens to come out right, which is exactly what you need.

## Three ways out

To fix a race on shared data, you can:

1. **Stop sharing.** Give each thread its own copy, and combine the copies after the join. For the arena, give each thread its own arena in its own part of the memory. This is often both the simplest and the fastest fix.
2. **Take turns.** Make the threads enter the critical section one at a time, with a lock. That is the next lesson.
3. **Make the step indivisible.** Use an atomic operation, which does the read, the change, and the write as one step that no other thread can split. That comes two lessons from now.

:::problem id=prac-race-trace title="Tracing a race" source="Lecture 5 - Pthreads in C.pdf" kind=exercise solution_origin=derived
Two threads each run `x = x + 2;` once on a shared `int x` that starts at 1. Each thread reads `x`, adds 2, and writes the result.

:::check id=prac-race-trace-q1
If thread A finishes before thread B starts, `x` ends as {{=5|3|1}}.

A writes 3, then B reads 3 and writes 5.
:::

:::check id=prac-race-trace-q2
If both threads read `x` before either one writes, `x` ends as {{=3|5|4}}.

Both read 1, both write 3. One addition is lost.
:::

:::check id=prac-race-trace-q3
Running the program 1,000 times and always getting 5 shows that {{=the race is rare on this machine, not that the code is correct|the code has no race|threads always run one after another}}.

Only a tool like ThreadSanitizer, or a reason why the threads cannot overlap, shows that the race is gone.
:::
:::

**Next:** locks, the standard way to make threads take turns, and the new problem they bring: two threads that wait for each other forever.
