---
id: thread-arguments
title: Giving a thread its input and getting its result
sources:
  - "Lecture 5 - Pthreads in C.pdf"
  - "Tutorial5.pdf"
---

The previous lesson started threads that all did the same thing. Real workers need input: which part of the array is theirs, or which number to work on. This lesson passes that input through the one `void *` argument, shows a very common bug when you do it in a loop, and then gets a result back from the thread.

## Passing one value

A thread function gets one pointer. To give it a number, pass the **address** of that number, and read it back inside:

```c
void *worker(void *arg) {
    int n = *(int *)arg;
    printf("n = %d\n", n);
    return NULL;
}

int main(void) {
    int value = 42;
    pthread_t t;
    pthread_create(&t, NULL, worker, &value);
    pthread_join(t, NULL);
    return 0;
}
```

- `&value` is the address of `value`, and `pthread_create` hands it to the worker as `arg`.
- `(int *)arg` turns the `void *` back into an `int *`, the type `main` really passed.
- `*(int *)arg` follows that pointer and reads the `int`, so `n` becomes 42.

Two facts follow from passing an address:

1. **Both threads reach the same object.** The worker reads `main`'s own `value`, not a copy of it.
2. **The object must stay alive.** `value` is a local variable of `main`. Here that is fine, because `main` waits in `pthread_join` and does not return while the worker runs. If the object disappeared first, the worker would read memory that no longer holds the value.

## A common bug: the same address for every thread

Now start four workers, and try to give each one its number:

```c
pthread_t threads[4];
for (int i = 0; i < 4; i++)
    pthread_create(&threads[i], NULL, worker, &i);
```

You might expect the workers to print 0, 1, 2, and 3 in some order. They may not. Every worker gets **the same address**, the address of `i`. By the time a worker reads it, the loop may already have changed `i`.

Each of these is a possible output:

- `0, 1, 2, 3`, if each worker happened to read `i` before the loop moved on,
- `3, 1, 2, 0`, the same values in another order,
- `0, 1, 1, 2`, if two workers read `i` while it held 1,
- `4, 4, 4, 4`, if the loop finished before any worker read `i`.

It can get even worse. After the loop ends, `i` no longer exists, and its memory can be reused for another variable. A worker that reads it then may print a value that has nothing to do with the loop.

:::trap
Never pass the address of a loop counter to a thread. All the threads receive the same address, and the loop keeps changing what is stored there.
:::

### The fix: one object for each thread

Give every thread its **own** object, in an array that lives until every thread has been joined:

```c
pthread_t threads[4];
int ids[4];

for (int i = 0; i < 4; i++) {
    ids[i] = i;
    pthread_create(&threads[i], NULL, worker, &ids[i]);
}

for (int i = 0; i < 4; i++)
    pthread_join(threads[i], NULL);
```

Worker `i` gets `&ids[i]`, and nobody changes `ids[i]` after the thread starts. The array stays alive in `main` until after the join loop, so every worker can read its value safely.

:::check id=chk-loop-address
A loop runs `for (int i = 0; i < 3; i++) pthread_create(&t[i], NULL, worker, &i);`, and each worker prints `*(int *)arg`. Which statement is true?

- [ ] Only `0, 1, 2` in some order can appear
- [x] `3, 3, 3` can appear
- [ ] Each worker always prints a different number

All three workers get the address of the same variable `i`. If the loop has already finished when they read it, `i` holds 3, and every worker prints 3. Giving each thread its own array element fixes this.
:::

## Passing several values with a structure

One pointer can carry many values, if it points to a structure. Put everything a thread needs into one `struct`, make one structure for each thread, and pass each thread the address of its own:

```c
typedef struct {
    int id;
    int task_count;
} ThreadArgs;

void *worker(void *arg) {
    const ThreadArgs *ctx = arg;
    printf("Thread %d: %d tasks\n", ctx->id, ctx->task_count);
    return NULL;
}
```

Inside the worker, `const ThreadArgs *ctx = arg;` turns the `void *` back into a pointer to the structure. In C, a `void *` converts to any other object pointer without a cast, so no `(ThreadArgs *)` is needed. The word `const` says this worker only reads its input. The compiler then stops you if you try to change it by mistake.

In `main`, one structure per thread:

```c
ThreadArgs args[NUM_THREADS];

for (int i = 0; i < NUM_THREADS; i++) {
    args[i].id = i;
    args[i].task_count = (i + 1) * 10;
    pthread_create(&threads[i], NULL, worker, &args[i]);
}
```

`args` lives in `main`'s stack frame. `main` joins every thread before it returns, so the structures stay alive as long as any worker can use them.

:::check id=chk-args-in-loop
A program declares `ThreadArgs a;` inside the body of a creation loop, fills it, and passes `&a` to each new thread. What is wrong?

- [ ] Nothing, because every pass of the loop makes a new `a`
- [x] Every thread may get the same address, and the next pass of the loop can overwrite the values before a thread reads them
- [ ] A structure can never be passed to a thread

A variable declared in the loop body usually reuses the same memory on every pass, and it stops existing when the pass ends. Use an array of structures declared before the loop, with one element for each thread.
:::

## Getting a result back

A thread can return one pointer, and `pthread_join` can collect it in its second argument. The returned pointer must point to something that **still exists** after the thread ends. The thread's local variables do not: they live on the thread's stack, which is gone once it finishes. So one way is to `malloc` the result:

```c
void *square(void *arg) {
    int x = *(int *)arg;
    int *result = malloc(sizeof *result);
    *result = x * x;
    return result;
}

int main(void) {
    int value = 3;
    pthread_t t;
    void *result;

    pthread_create(&t, NULL, square, &value);
    pthread_join(t, &result);
    printf("%d\n", *(int *)result);
    free(result);
    return 0;
}
```

- The worker stores `9` in a heap block and returns its address.
- `pthread_join(t, &result)` waits, then puts that address into `result`.
- `main` reads the 9, and then calls `free`, because the block came from `malloc` and nobody else will free it.

:::trap
Never return the address of a local variable from a thread function. The thread's stack disappears when it ends, so the address would point to memory that holds nothing useful.
:::

### A simpler way: put the result in the input structure

Calling `malloc` for every result is slow and easy to forget to `free`. Often it is simpler to give the structure a field for the answer. Each worker writes its own field, and `main` reads it after the join:

```c
typedef struct {
    int x;
    int square;   /* filled in by the worker */
} SquareTask;

void *square(void *arg) {
    SquareTask *t = arg;
    t->square = t->x * t->x;
    return NULL;
}
```

This works because each thread writes only its own structure, and `main` reads it only after `pthread_join`. The next lesson uses exactly this pattern to split up real work.

:::problem id=prac-arg-lifetime title="Will the worker read the right value?" source="Lecture 5 - Pthreads in C.pdf" kind=exercise solution_origin=derived
Each part describes how `main` hands an `int` to one worker, which reads it with `*(int *)arg`.

:::check id=prac-arg-lifetime-q1
`main` declares `int ids[4]`, sets `ids[k] = k`, passes `&ids[k]` to thread `k`, and joins all four threads before returning. This is {{=safe, because each thread has its own element and the array outlives the threads|unsafe, because arrays cannot be shared|unsafe, because the threads share one address}}.

One object per thread, alive until after every join.
:::

:::check id=prac-arg-lifetime-q2
A helper function declares `int n = 7;`, starts a thread with `&n`, and returns at once without joining. This is {{=unsafe, because n stops existing when the helper returns, maybe before the thread reads it|safe, because the thread got the address before the helper returned|safe, because n is an int}}.

The address is only useful while the object is alive.
:::

:::check id=prac-arg-lifetime-q3
A worker computes `int r = 5;` and returns `&r`. After the join, reading through that pointer is {{=a bug, because r lived on the finished thread's stack|fine, because join waited for the thread|fine, because r was set before the return}}.

Return a heap block, or write the answer into a structure that the caller owns.
:::
:::

**Next:** with input and output sorted out, you can split a real job, such as adding up an array, across several threads.
