---
id: creating-threads
title: Starting a thread and waiting for it
sources:
  - "Lecture 5 - Pthreads in C.pdf"
  - "Tutorial5.pdf"
---

The previous lesson said what a thread is. This one writes your first program with two threads. You will start a thread with `pthread_create`, wait for it with `pthread_join`, and see why the order in which threads print can change from one run to the next.

## A first program with a thread

Here is the smallest useful example. The new thread prints one line, and `main` waits for it:

```c
#include <pthread.h>
#include <stdio.h>

void *worker(void *arg) {
    printf("Hello from a thread!\n");
    return NULL;
}

int main(void) {
    pthread_t t;
    pthread_create(&t, NULL, worker, NULL);
    pthread_join(t, NULL);
    return 0;
}
```

Line by line:

- `#include <pthread.h>` brings in the Pthreads functions and types.
- `worker` is the function the new thread will run. Its shape is fixed, as the next section explains.
- `pthread_t t;` is a variable that will hold the new thread's **ID**, a value that names this thread so you can refer to it later.
- `pthread_create(&t, NULL, worker, NULL)` starts a new thread that runs `worker`. It writes the thread's ID into `t`.
- `pthread_join(t, NULL)` makes `main` **wait** until thread `t` has finished.

To build it, add `-pthread` to the `gcc` command. It tells the compiler and the linker to use the thread library:

```bash
gcc -Wall -Wextra hello.c -o hello -pthread
```

### The four arguments of `pthread_create`

| Argument | Here | Meaning |
| --- | --- | --- |
| `&t` | address of `t` | Where to store the new thread's ID |
| `NULL` | no settings | Special settings for the thread. `NULL` means the defaults |
| `worker` | a function | The function the new thread starts in. This is a function pointer, which you met in Lecture 2 |
| `NULL` | no input | One pointer that is handed to `worker` as its `arg` |

## The shape of a thread function

Every thread function has exactly this shape:

```c
void *worker(void *arg)
```

It takes one `void *` and returns one `void *`. Recall from Lecture 2 that a `void *` is a pointer that can hold the address of any type of object. That is why the shape works for every job:

- **One input.** `arg` can point to an `int`, an array, or a whole structure, so a thread can get as much input as you like through one pointer.
- **One result.** The returned pointer is handed to whoever calls `pthread_join` for this thread.
- **A cast to get the type back.** Inside the function you convert `arg` back to the type the caller really passed, for example `int *`.

If a thread does not use its argument, you can write `(void)arg;` to tell the compiler it is unused on purpose. That silences the warning from `-Wextra`.

:::check id=chk-thread-signature
Which function can be given to `pthread_create` as the function the new thread runs?

- [ ] `int work(int n)`
- [ ] `void work(void)`
- [x] `void *work(void *arg)`

A thread function must take one `void *` and return one `void *`. Any input goes in through that one pointer, and any result comes back through the returned pointer.
:::

## Waiting with `pthread_join`

After `pthread_create` returns, there are two threads, and they run **at the same time**. `main` does not stop to let the worker go first. Either one may print first, and on a machine with several cores they may really run in the same instant.

`pthread_join(t, NULL)` is a fixed meeting point. The thread that calls it stops and waits until thread `t` has returned from its function. After `pthread_join` returns, you know for certain that the worker has finished all its work.

![A timeline with two rows. main calls pthread_create, then calls pthread_join and stays blocked while the worker row runs worker(). When the worker returns, main continues past join.](../assets/figures/thread-join.svg)

The second argument of `pthread_join` is where to store the worker's returned pointer. `NULL` means you do not need it. The next lesson uses it to collect a result.

### What happens if `main` does not wait?

Remove the `pthread_join` line, and the worker's message often never appears. When `main` returns, the **whole process** ends, and every thread in it stops at once, finished or not. When a program like this was run 3,000 times, the worker's line appeared in only 49 of the runs.

:::trap
Returning from `main` ends the program, including every other thread. Always join the threads whose work you need before `main` returns.
:::

There is one way for `main` to end without ending the other threads: call `pthread_exit(NULL)` instead of `return 0`. That ends only the main thread. The process keeps running until its last thread finishes. In the same way, a worker that returns a pointer `p` is the same as the worker calling `pthread_exit(p)`.

## Many threads at once

To run several workers, keep their IDs in an array. Start all of them first, and only then join all of them, in a second loop:

```c
#define NUM_THREADS 3

pthread_t threads[NUM_THREADS];

for (int i = 0; i < NUM_THREADS; i++)
    pthread_create(&threads[i], NULL, worker, NULL);

for (int i = 0; i < NUM_THREADS; i++)
    pthread_join(threads[i], NULL);

puts("All workers finished");
```

Why two loops? If you joined inside the first loop, `main` would wait for worker 0 to finish before it even starts worker 1. The threads would run one after another, and you would gain nothing.

Joining in order 0, 1, 2 does not force the workers to finish in that order. If worker 1 finishes first, it simply waits until `main` gets around to joining it.

:::check id=chk-join-in-loop
A program starts 4 threads with `pthread_create` and calls `pthread_join` for each one right after creating it, in the same loop. Each thread's job takes 1 second. About how long does the program take on a machine with 4 free cores?

- [ ] About 1 second
- [x] About 4 seconds
- [ ] About a quarter of a second

`main` waits for each thread before it starts the next, so only one thread runs at a time: 4 jobs of 1 second each. Creating all four first, then joining all four, would take about 1 second.
:::

## Who prints first?

Suppose each of three workers prints a line such as `Thread 1: 20 tasks`, and `main` prints `All workers finished` after joining them all. Which outputs are possible?

```text
A                      B                      C
Thread 0: 10 tasks     Thread 2: 30 tasks     Thread 0: 10 tasks
Thread 1: 20 tasks     Thread 0: 10 tasks     All workers finished
Thread 2: 30 tasks     Thread 1: 20 tasks     Thread 1: 20 tasks
All workers finished   All workers finished   Thread 2: 30 tasks
```

- **A is possible.** It is the order you might expect, but it is only one of many.
- **B is possible.** The operating system decides which thread runs when, so the workers can print in any order. In 3,000 runs of a program like this, all six orders of the three workers appeared, some far more often than others.
- **C is impossible.** `main` prints its line only after all three joins have returned, and a join returns only after its worker has finished, including its `printf`.

`pthread_join` promises one thing: everything the worker did happens before the code after the join. It promises nothing about the order of the workers among themselves.

## Checking for errors

Like `malloc`, `pthread_create` can fail, for example when the system cannot make any more threads. Pthreads functions report errors in their own way: they **return** 0 on success and an error number on failure. They do not set `errno`, the global error variable that many other C functions use.

```c
#include <string.h>

int rc = pthread_create(&t, NULL, worker, NULL);
if (rc != 0) {
    fprintf(stderr, "pthread_create: %s\n", strerror(rc));
    return 1;
}
```

`strerror(rc)` turns the error number into a short message that a person can read. Check `pthread_join` the same way. A failed `pthread_create` makes no thread, so there is nothing to join afterwards.

## Threads nobody waits for

By default a thread is **joinable**: some other thread is expected to call `pthread_join` for it. Until that happens, the system keeps a little information about the finished thread, so that the join can collect its return value.

If you never need a thread's result, you can make it **detached** with `pthread_detach(t)`. A detached thread cleans up after itself when it finishes. You cannot join it, and its return value is lost. Detached threads suit background jobs that run on their own, such as writing a log.

| Joinable (the default) | Detached |
| --- | --- |
| Another thread calls `pthread_join` | Nobody joins it |
| The join collects the return value | The return value is lost |
| Kept by the system until joined | Cleaned up as soon as it finishes |

:::problem id=prac-join-order title="What can this program print?" source="Tutorial5.pdf" kind=exercise solution_origin=source
`main` creates three threads in a loop, then joins all three in a second loop, then prints `All workers finished`. Each thread prints one line with its number.

:::check id=prac-join-order-q1
Can the workers print in the order 2, 0, 1? {{=Yes, the system may run the threads in any order|No, threads always run in the order they were created|Only on a machine with exactly 3 cores}}.

Creating a thread does not make it run first. The operating system chooses.
:::

:::check id=prac-join-order-q2
Can `All workers finished` appear before a worker's line? {{=No, it comes after every join, and each join waits for its worker to finish|Yes, if that worker was slow|Yes, if main is faster than the workers}}.

Each join returns only after its worker has completed, so the last line is always last.
:::

:::check id=prac-join-order-q3
If the join loop is removed and `main` returns right after creating the threads, {{=some or all of the workers' lines may never be printed|every line is still printed, only in a different order|the program will not compile}}.

Returning from `main` ends the whole process and stops the workers wherever they are.
:::
:::

**Next:** how to give each thread its own input, and how to get a result back.
