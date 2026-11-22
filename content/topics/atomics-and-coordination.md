---
id: atomics-and-coordination
title: "Atomics, and making threads wait for each other"
sources:
  - "Lecture 5 - Pthreads in C.pdf"
---

A mutex protects any piece of code, but taking a lock for one tiny update is a lot of machinery. This lesson shows **atomic operations**, which change one shared value safely without a lock. It then uses them to stop a search early and to hand out work, and ends with two tools that make threads wait on purpose: barriers and condition variables.

## One step that cannot be split

The problem with `counter++` was that it is three steps, and another thread could slip in between them. An **atomic operation** does the whole read-change-write as one indivisible step. Other threads see the value either before it or after it, never halfway.

The processor has special instructions for this, and C reaches them through the header `<stdatomic.h>`:

```c
#include <stdatomic.h>

atomic_int  counter = 0;
atomic_bool ready = false;
```

`atomic_int` is an `int` that is only changed through atomic operations, and `atomic_bool` is the same for a true-or-false value. `atomic_long` and others work the same way.

:::definition id=def-atomic title="Atomic operation" source="Lecture 5 - Pthreads in C.pdf"
An **atomic operation** reads or changes one shared value in a single indivisible step. No other thread can see it half done, so atomic operations on the same value never lose updates.
:::

## The basic operations

| Call | What it does | Returns |
| --- | --- | --- |
| `atomic_load(&x)` | reads `x` | the value |
| `atomic_store(&x, v)` | sets `x` to `v` | nothing |
| `atomic_fetch_add(&x, n)` | adds `n` to `x` | the value **before** the addition |
| `atomic_exchange(&x, v)` | sets `x` to `v` | the value **before** the change |

The "before" value matters. If `counter` is 7 and a thread runs `int old = atomic_fetch_add(&counter, 1);`, then `counter` becomes 8 and `old` is 7. Two threads doing this at the same time always get **different** `old` values, such as 7 and 8. Later sections use that to hand out work.

## An atomic counter

```c
atomic_long counter = 0;

void *worker(void *arg) {
    for (long i = 0; i < 1000000; i++)
        atomic_fetch_add(&counter, 1);
    return NULL;
}
```

Every increment is now a single step, so two workers always end with exactly 2,000,000, with no mutex.

It is still not free. Every thread keeps changing the **same** memory, so the cores keep passing that piece of memory back and forth between them. The same advice as before applies: count in a local variable, then add it to the shared total once, with one `atomic_fetch_add`.

:::check id=chk-fetch-add-old
`atomic_int next = 5;` Two threads each run `int mine = atomic_fetch_add(&next, 1);` at the same time. What can the two values of `mine` be?

- [ ] Both 5
- [x] One gets 5 and the other gets 6
- [ ] Both 6

Each fetch-add happens as one step, one after the other. The first returns 5 and leaves 6, the second returns 6 and leaves 7. They never get the same number.
:::

## A tiny lock built from an atomic

Atomics are enough to build a simple lock, called a **spinlock**. It uses `atomic_flag`, the simplest atomic type, which is only set or clear:

```c
atomic_flag lock = ATOMIC_FLAG_INIT;   /* starts clear */

void spin_lock(void) {
    while (atomic_flag_test_and_set(&lock)) {
        /* someone else holds it: try again */
    }
}

void spin_unlock(void) {
    atomic_flag_clear(&lock);
}
```

`atomic_flag_test_and_set` sets the flag and returns what it was **before**, in one step. If it was clear, it returns false, and this thread now owns the lock, so the loop ends. If it was already set, it returns true: someone else owns the lock, and the thread tries again.

A spinlock is still a lock, and the waiting thread "spins", burning processor time on a loop that does nothing useful. A mutex usually lets a waiting thread sleep instead. Use a spinlock only when the wait is known to be very short.

## Atomic or mutex?

| Atomic | Mutex |
| --- | --- |
| One simple update of one value | Protects a whole sequence of steps |
| A counter, a flag, a "next job" number | Can keep several related values in step |
| No critical section to forget to unlock | Makes it clear who owns the data |
| Clever designs with many atomics are hard to get right | A waiting thread can sleep |

Pick the simplest tool that makes the **whole** operation correct. Moving money from one account to another changes two balances that must change together, so it needs a mutex. Two separate atomic updates would let another thread see the money in neither account for a moment.

:::check id=chk-atomic-or-mutex
A program must add an item to a shared list and also increase the shared count of items, so that the count always matches the list. What should protect them?

- [ ] An atomic counter alone
- [x] One mutex held around both updates
- [ ] Nothing, if each update is a single line

The two updates must happen together. An atomic counter keeps the count itself correct, but another thread could still see the new item before the count changes. A mutex around both keeps them in step.
:::

## Stop early with a shared flag

To search an array for a value with several threads, give each thread its own range. As soon as one thread finds the value, the others can stop. A shared atomic flag tells them:

```c
atomic_bool found = false;

/* inside each worker, over its own range */
for (size_t i = t->begin; i < t->end; i++) {
    if (atomic_load(&found))
        break;                     /* someone else found it */
    if (a[i] == target) {
        t->found_index = i;        /* this thread's own result */
        atomic_store(&found, true);
        break;
    }
}
```

Each task keeps its own `found_index`, so the only shared value is the flag. `main` looks at the tasks after the joins to see which thread found it.

## Hand out work as threads become free

Splitting the work into equal ranges up front is called **static** distribution. It works well when every piece takes the same time. When some pieces are much slower than others, one thread can end up with all the slow ones while the others sit idle.

**Dynamic** distribution fixes that. The jobs are numbered, and each thread takes the next free number whenever it is ready for more work:

```c
atomic_int next_task = 0;

void *worker(void *arg) {
    while (1) {
        int id = atomic_fetch_add(&next_task, 1);
        if (id >= task_count)
            break;
        process_task(id);
    }
    return NULL;
}
```

Because `atomic_fetch_add` gives every caller a different old value, every job number is handed out exactly once, and a thread that finishes early just takes more jobs.

## Waiting for everyone: a barrier

Some jobs have **phases**. In phase 1, each thread computes its own partial result. In phase 2, each thread needs **all** the partial results. A thread that races ahead into phase 2 would read results that are not ready yet.

A **barrier** is a meeting point. Each thread that reaches it waits until all of them have reached it, and then they all continue:

```c
pthread_barrier_t barrier;
pthread_barrier_init(&barrier, NULL, T);   /* T threads take part */

/* in each of the T threads: */
phase_one();
pthread_barrier_wait(&barrier);
phase_two();

/* after all threads are joined: */
pthread_barrier_destroy(&barrier);
```

Barriers are part of Pthreads on Linux. macOS does not provide `pthread_barrier_t`, so code that uses it must run on Linux, for example in WSL or a Linux virtual machine.

## Waiting for a signal: condition variables

Sometimes a thread must wait until some condition becomes true, for example "the queue has a job in it". Checking again and again in a loop wastes the processor. A **condition variable** lets the thread sleep until another thread tells it to check again. It always works together with a mutex that protects the condition:

```c
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  c = PTHREAD_COND_INITIALIZER;
int ready = 0;

/* the thread that waits */
pthread_mutex_lock(&m);
while (!ready)
    pthread_cond_wait(&c, &m);
/* ready is 1 here, and this thread holds m */
pthread_mutex_unlock(&m);

/* the thread that makes it true */
pthread_mutex_lock(&m);
ready = 1;
pthread_cond_signal(&c);
pthread_mutex_unlock(&m);
```

`pthread_cond_wait` releases the mutex and goes to sleep, as one step, so the signal cannot slip by in between. When it wakes up, it takes the mutex again before returning. The check is in a `while`, not an `if`, because a thread can wake up when the condition is still false, so it must check again. `pthread_cond_signal` wakes one waiting thread, and `pthread_cond_broadcast` wakes all of them.

:::problem id=prac-ticket-order title="Handing out job numbers" source="Lecture 5 - Pthreads in C.pdf" kind=exercise solution_origin=derived
`atomic_int next_task = 0;` and `task_count` is 5. Two threads each run the loop that takes `id = atomic_fetch_add(&next_task, 1)` and stops when `id >= task_count`.

:::check id=prac-ticket-order-q1
The job numbers that get processed are {{=0, 1, 2, 3, 4, each exactly once|0 to 4, some of them twice|only the even numbers}}.

Every fetch-add returns a different old value, so each number up to 4 goes to exactly one thread.
:::

:::check id=prac-ticket-order-q2
When both threads have stopped, `next_task` holds {{=7|5|6}}.

Five fetch-adds handed out 0 to 4. Each thread then made one more fetch-add, got 5 or 6, and stopped. That is 7 additions in all.
:::

:::check id=prac-ticket-order-q3
If job 0 takes much longer than the others, {{=the other thread processes most of the remaining jobs|each thread still processes about half of the jobs|the program waits for job 0 before handing out job 1}}.

The free thread keeps taking the next number while the first one is busy.
:::
:::

**Next:** how to measure what all these threads actually gained, and a full parallel program from start to finish.
