---
id: mutexes-and-deadlock
title: "Locks: mutexes and deadlock"
sources:
  - "Lecture 5 - Pthreads in C.pdf"
---

The previous lesson showed that two threads changing the same variable lose updates. This lesson fixes that with a **mutex**, a lock that lets only one thread at a time into a critical section. Then it shows how to use a lock without making the program slow, and how two locks can make threads wait for each other forever.

## A lock with one key

Picture a single bathroom with one key on a hook. To go in, you take the key. If the key is gone, you wait by the door. When you come out, you hang the key back, and the next person waiting takes it.

A **mutex** (short for "mutual exclusion") is that key. A thread **locks** the mutex before it enters the critical section, and **unlocks** it when it leaves. If another thread already holds the mutex, the lock call waits until it is free. So only one thread can be inside at a time.

:::definition id=def-mutex title="Mutex" source="Lecture 5 - Pthreads in C.pdf"
A **mutex** is a lock that at most one thread can hold at a time. `pthread_mutex_lock` waits until the mutex is free and then takes it. `pthread_mutex_unlock` gives it back, so that one waiting thread can take it.
:::

## The mutex functions

```c
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

pthread_mutex_lock(&lock);
/* critical section */
pthread_mutex_unlock(&lock);

pthread_mutex_destroy(&lock);
```

- `pthread_mutex_t` is the type of a mutex. `PTHREAD_MUTEX_INITIALIZER` sets it up as a free lock, ready to use.
- `pthread_mutex_lock` waits until the lock is free, then takes it. The thread is now its **owner**.
- `pthread_mutex_unlock` releases it. Only the owner may unlock a mutex.
- `pthread_mutex_destroy` cleans the mutex up when no thread will ever use it again, for example after every thread has been joined.

Every successful lock must be matched by exactly one unlock, on **every** path through the code. If a function returns early from inside the critical section and forgets to unlock, every other thread waits forever.

## The counter, fixed

```c
long counter = 0;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

void *worker(void *arg) {
    for (long i = 0; i < 1000000; i++) {
        pthread_mutex_lock(&lock);
        counter++;
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}
```

Now the read, the add, and the write of `counter++` all happen while the thread holds the lock. No other thread can read `counter` in the middle. Two workers always end with exactly 2,000,000.

It is correct, but it is **slow**. Every single increment now takes and releases the lock. When two threads want the lock at the same moment, which is called **contention**, one of them waits. The two threads end up mostly taking turns, so the program can be slower than one thread with no lock at all.

:::check id=chk-unlock-path
A function locks a mutex, then runs `if (value < 0) return -1;`, and unlocks the mutex only at its end. What happens when `value` is negative?

- [ ] The mutex unlocks itself when the function returns
- [x] The function returns while still holding the mutex, so any thread that tries to lock it later waits forever
- [ ] Nothing, because the early return skips the critical section

A mutex has no idea that the function ended. Every path out of the critical section, including early returns, must unlock it.
:::

## Lock less often

The fix for slowness is to do most of the work **without** the lock, and take it only once at the end:

```c
void *worker(void *arg) {
    long local = 0;
    for (long i = 0; i < 1000000; i++)
        local++;               /* private, no lock needed */

    pthread_mutex_lock(&lock);
    counter += local;          /* one shared update */
    pthread_mutex_unlock(&lock);
    return NULL;
}
```

`local` is a local variable, so each thread has its own copy on its own stack, and no lock is needed for it. The shared `counter` is touched once per thread instead of a million times. The answer is the same, and the lock almost never makes anyone wait.

| Lock on every increment | Count locally, lock once |
| --- | --- |
| A million lock operations per thread | One lock operation per thread |
| Threads keep waiting for each other | Threads almost never wait |
| Correct, but often slower than one thread | Correct and fast |

### A histogram: share less

A **histogram** counts how many values fall into each group, or **bin**. Say the values are 0 to 9, and `histogram[v]` counts how often `v` appears. A first attempt shares one histogram and locks around each update:

```c
for (size_t i = begin; i < end; i++) {
    int value = a[i];
    pthread_mutex_lock(&lock);
    histogram[value]++;
    pthread_mutex_unlock(&lock);
}
```

It is correct, but it takes the lock once per element, and threads wait for each other even when they update **different** bins. Better: give each thread its own bins inside its task, with no lock at all, and let `main` add the bins together after the joins:

```c
typedef struct {
    const int *a;
    size_t begin, end;
    long bins[10];
} Task;

/* inside the worker */
for (size_t i = t->begin; i < t->end; i++)
    t->bins[t->a[i]]++;
```

The idea is the same as with the counter: **split the output** so each thread owns its part, and combine at the end. That removes the lock from the loop that runs most often.

:::check id=chk-lock-once
Four threads each count how many even numbers are in their own quarter of an array, and the program needs the total. Which design does the least locking while staying correct?

- [ ] Lock a mutex around every `total++`
- [x] Count in a local variable, then lock once to add it to `total`
- [ ] Add to `total` with no lock, since each thread has its own quarter

Each thread's counting is private, so it needs no lock. Only the single update of the shared `total` needs one. With no lock at all, the updates of `total` race.
:::

## Deadlock: waiting forever

Locks bring a new problem. Suppose two threads each need **two** mutexes, `m1` and `m2`, but take them in opposite orders:

```c
/* thread A */                 /* thread B */
pthread_mutex_lock(&m1);       pthread_mutex_lock(&m2);
pthread_mutex_lock(&m2);       pthread_mutex_lock(&m1);
```

If A takes `m1` and B takes `m2` at about the same time, then A waits for `m2`, which B holds, and B waits for `m1`, which A holds. Neither can go on, and neither will ever release what it holds. This is a **deadlock**: the program does not crash, it just stops making progress.

![Thread A holds mutex 1 and waits for mutex 2. Thread B holds mutex 2 and waits for mutex 1. The arrows form a circle, so neither thread can continue.](../assets/figures/deadlock.svg)

:::definition id=def-deadlock title="Deadlock" source="Lecture 5 - Pthreads in C.pdf"
A **deadlock** is a state in which two or more threads each wait for a lock that another one of them holds, in a circle, so none of them can ever continue.
:::

### A real example: moving money between accounts

```c
typedef struct {
    int id;
    long balance;
    pthread_mutex_t lock;
} Account;

void transfer(Account *from, Account *to, long amount) {
    pthread_mutex_lock(&from->lock);
    pthread_mutex_lock(&to->lock);
    from->balance -= amount;
    to->balance += amount;
    pthread_mutex_unlock(&to->lock);
    pthread_mutex_unlock(&from->lock);
}
```

Taking both locks makes sure nobody sees the money in neither account, or in both. But if thread A calls `transfer(&x, &y, 10)` while thread B calls `transfer(&y, &x, 5)`, A locks `x` first and B locks `y` first. That is exactly the circle above.

### The fix: one fixed order

Decide one order for all locks, and always take them in that order. For accounts, lock the one with the **smaller `id` first**, whichever direction the money goes:

```c
void transfer(Account *from, Account *to, long amount) {
    Account *first  = from->id < to->id ? from : to;
    Account *second = from->id < to->id ? to : from;

    pthread_mutex_lock(&first->lock);
    pthread_mutex_lock(&second->lock);
    from->balance -= amount;
    to->balance += amount;
    pthread_mutex_unlock(&second->lock);
    pthread_mutex_unlock(&first->lock);
}
```

Now both threads try to take the same lock first. Whoever gets it also gets the second one, finishes, and releases both. A circle of waiting can no longer form.

Other habits that make deadlock less likely:

- Keep critical sections **short** and simple enough to read at a glance.
- Do not call code you do not know while holding a lock. It may try to take another lock.
- Release every lock you took on **every** path out of the function.

:::check id=chk-lock-order
Thread A runs `transfer(&acc3, &acc7, 50)` and thread B runs `transfer(&acc7, &acc3, 20)` at the same time. Both use a `transfer` that always locks the account with the smaller `id` first, and `acc3` has id 3. Which lock does each thread try to take first?

- [ ] A takes `acc3` first and B takes `acc7` first
- [x] Both try to take `acc3` first
- [ ] Both try to take `acc7` first

Both calls involve ids 3 and 7, and the rule says smaller id first. Both threads go for `acc3`'s lock, so one waits for the other instead of forming a circle.
:::

:::problem id=prac-bank-deadlock title="Two transfers at once" source="Lecture 5 - Pthreads in C.pdf" kind=exercise solution_origin=source
Account X has id 1 and account Y has id 2. `transfer(from, to, amount)` first locks `from`, then locks `to`. Thread A runs `transfer(&X, &Y, 10)` and thread B runs `transfer(&Y, &X, 10)` at the same time.

:::check id=prac-bank-deadlock-q1
If A locks X and then B locks Y, the program {{=deadlocks, because each thread waits for the lock the other holds|finishes normally|crashes with a segmentation fault}}.

A waits for Y and B waits for X, in a circle.
:::

:::check id=prac-bank-deadlock-q2
With the rule "lock the smaller id first", both threads first lock {{=X|Y|their own from account}}.

X has the smaller id, 1, in both calls.
:::

:::check id=prac-bank-deadlock-q3
A deadlocked program usually {{=stops making progress without printing an error|prints a deadlock warning and exits|runs slower but finishes}}.

The threads are simply waiting. Nothing fails, so nothing reports a problem.
:::
:::

**Next:** atomic operations, which update one shared value safely without a lock, and two tools that make threads wait for each other on purpose.
