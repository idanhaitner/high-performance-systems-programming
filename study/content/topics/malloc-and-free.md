---
id: malloc-and-free
title: "Memory on request: malloc and free"
sources:
  - "Lecture 2 - Memory management.pptx"
---

Until now, every array had a size written in the code, like `int a[4]`. But often you only learn how much memory you need **while the program runs**: how many students the user types in, how long a line of text is. This lesson shows how to ask for memory at that moment, with `malloc`, and how to give it back, with `free`. Asking for memory while the program runs is called **dynamic memory allocation**. It uses the **heap**, the memory area you met in [Programs and processes](topic:source-to-process).

## Asking for memory with malloc

Think of the heap as a storage room. You go to the desk and say "I need 4000 bytes". The desk finds a free shelf that big and hands you a ticket with the shelf's address. Later you return the ticket so someone else can use the shelf.

In C the desk is the function `malloc` ("memory allocation"), from `<stdlib.h>`:

```c
#include <stdlib.h>

int n = 1000;
int *A = malloc(n * sizeof(int));
for (int i = 0; i < n; i++)
    A[i] = i;
```

Line by line:

- `malloc` receives **one number: how many bytes you want**. We want room for 1000 `int`s, and each `int` is `sizeof(int)` bytes (4 on typical machines), so we ask for `n * sizeof(int)`, that is 4000 bytes.
- `malloc` returns the **address of the first byte** of the new block. We keep it in `A`.
- From then on `A` is used exactly like an array: `A[i]`. In the previous lesson you saw why this works: `A[i]` just means `*(A + i)`.

Always write `n * sizeof(int)`, not `n * 4`. The size of `int` is not the same on every machine, and `sizeof` also stays right if you later change the type.

:::definition id=def-malloc title="malloc" source="Lecture 2 - Memory management.pptx"
`malloc(size)` reserves a block of `size` bytes on the heap and returns the address of its first byte. The bytes inside are not set to anything: they hold garbage until you write to them. If there is no memory left, `malloc` returns `NULL`.
:::

### What void * means

`malloc` does not know whether you will store `int`s, `double`s, or text. So it returns a `void *`: "an address of something, type unknown". In C, a `void *` converts by itself to any other pointer type when you store it, so `int *A = malloc(...)` needs nothing extra. (In C++, a different language, you would need to write the conversion yourself.)

### Check for NULL

If the computer is out of memory, `malloc` returns `NULL`. Following `NULL` crashes, so careful code checks:

```c
int *A = malloc(n * sizeof(int));
if (A == NULL) {
    printf("out of memory\n");
    return 1;
}
```

This rarely happens on a laptop, but asking for a huge amount by mistake (for example a negative size that turns into a giant one) makes it happen right away.

:::check id=chk-malloc-size
`double *A;` must get room for 50 `double`s. Which call asks for the right amount?

- [x] `malloc(50 * sizeof(*A))`
- [ ] `malloc(sizeof(A))`
- [ ] `malloc(50)`

`*A` is a `double`, so `sizeof(*A)` is the size of one element, and `sizeof` does not follow the pointer. `sizeof(A)` is only the size of the pointer, and `malloc(50)` is 50 bytes, not 50 elements.
:::

## Where the memory lives

The variable `A` itself is a normal local variable, so it sits on the **stack**, the area where a function's local variables live. Only the block it points to sits on the **heap**.

![The pointer A lives on the stack and holds the address of a block of 1000 ints on the heap.](../assets/figures/heap-block.svg)

This difference matters a lot:

- The stack box `A` disappears when the function ends, like every local variable.
- The heap block stays until **you** give it back. It does not care when functions end.

:::check id=chk-heap-after-return
A function runs `int *A = malloc(4000);` and then returns without calling `free`. What is left?

- [x] The box `A` is gone, but the 4000-byte block is still reserved
- [ ] Both are gone, because the function ended
- [ ] Both are still there, until the program ends

`A` is a local variable on the stack, so it disappears when the function ends. The heap block stays until someone calls `free`. But the only copy of its address was in `A`, so now nobody can free it.
:::

## Giving memory back with free

When you are done with the block, return it with `free`:

```c
int n = 1000;
int *A = malloc(n * sizeof(int));
for (int i = 0; i < n; i++)
    A[i] = i;
free(A);   /* give the 4000 bytes back */
```

`free` receives the address that `malloc` gave you and marks the block as free again. Nothing frees it for you: in C, it is the programmer's job.

If you forget, the block stays reserved until the whole program ends, and nobody can use it. That is a **memory leak**. One small leak is harmless, but a leak inside a loop that runs a million times can eat all the memory of a long-running program, like a server.

:::definition id=def-memory-leak title="Memory leak" source="Lecture 2 - Memory management.pptx"
A memory leak is heap memory that the program reserved and never freed, and can no longer free because it lost the address. It stays taken until the program ends.
:::

## Three ways free goes wrong

`free` trusts you completely. Give it a wrong address and the program breaks.

### 1. Freeing an address that is not the start of the block

```c
int *A = malloc(n * sizeof(int));
A++;       /* A now points to A[1], not the start */
free(A);   /* crash: free(): invalid pointer */
```

`free` needs the **exact** address `malloc` returned, the start of the block. `A++` moved the pointer one `int` forward, so `free` gets an address it never handed out, and the program stops with a message like `free(): invalid pointer`. If you need to walk through the block, use a second pointer and keep the first one for `free`.

### 2. Freeing the same block twice

```c
free(A);
free(A);   /* crash: free(): double free detected */
```

After the first `free`, the block no longer belongs to you. Freeing it again is a **double free**. On Linux it stops the program with a message like `free(): double free detected in tcache 2` and `Aborted (core dumped)`.

### 3. Using the block after freeing it

```c
free(A);
A[0] = 5;  /* undefined behavior: the block is not yours anymore */
```

After `free`, `A` still holds the old address, but the memory there may already belong to something else. A pointer like that is called a **dangling pointer**. Writing through it is undefined behavior, and it often does not crash right away, which makes it one of the hardest bugs to find.

:::definition id=def-dangling title="Dangling pointer" source="Lecture 2 - Memory management.pptx"
A dangling pointer holds the address of memory that is no longer yours, for example a block you already freed, or a local variable of a function that has returned.
:::

### The fix for all three: set the pointer to NULL

```c
free(A);
A = NULL;
free(A);   /* fine: free(NULL) does nothing */
```

Right after `free`, store `NULL` in the pointer. Then:

- `free(NULL)` is allowed and does nothing, so an accidental second `free` is harmless.
- Using `A[0]` now crashes at once with a segmentation fault, right at the bug, instead of quietly damaging memory.

:::trap
Thinking `free(A)` also changes `A`. It does not: `A` keeps the old address, and only the memory behind it is gone. That is exactly why you write `A = NULL;` on the next line.
:::

:::check id=chk-free-walk
```c
int *A = malloc(4 * sizeof(int));
int *walk = A;
walk++;
walk--;
free(walk);
```

Is the `free` correct?

- [x] Yes: `walk` holds the address `malloc` returned
- [ ] No: only the variable that first got the address may be freed
- [ ] No: `walk` moved, so `free` no longer knows the block

`free` receives a value, not a variable. After `walk++` and `walk--`, the value is the start of the block again, and that is all `free` needs. `A` must not be freed as well, because there is only one block.
:::

## calloc: memory that starts at zero

`malloc` gives you garbage-filled bytes. If you want them all set to 0, use `calloc` ("contiguous allocation"):

```c
int n = 1000;
int *A = calloc(n, sizeof(int));   /* 1000 ints, all 0 */
```

Notice that `calloc` takes **two** numbers: how many elements, and how many bytes each one takes. It multiplies them for you, reserves the block, and fills it with zeros. You free it with `free`, just like memory from `malloc`.

## Practice

:::problem id=prac-malloc-bytes title="How many bytes to ask for" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
You need room for 50 `double`s. A `double` is 8 bytes.

:::check id=prac-malloc-bytes-q1
After `int *A = malloc(10);`, the line `A[2] = 1;` {{=writes past the end of the block|is fine, because A has room for 10 ints|does not compile}}.

`malloc` counts bytes, so there are only 10. `A[2]` uses bytes 8 to 11 of a 4-byte `int`. The compiler cannot see this, and the program may even seem to work.
:::

:::check id=prac-malloc-bytes-q2
With `calloc`, the same request is {{=calloc(50, sizeof(double))|calloc(400)|calloc(50 * sizeof(double))}}.

`calloc` takes the count and the size of one element as two separate numbers, and multiplies them itself.
:::
:::

:::problem id=prac-free-errors title="What goes wrong with free" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
Each snippet starts with `int *A = malloc(10 * sizeof(int));`.

:::check id=prac-free-errors-q1
`int *B = A; free(A); free(B);` fails because {{=the same block is freed twice|B has no block of its own to free|free cannot be called with B}}.

`B = A` copies an address, not a block. There is one block, so there must be one `free`, no matter how many pointers hold its address.
:::

:::check id=prac-free-errors-q2
Which version is safe?

- [ ] `free(A); free(A);`
- [x] `free(A); A = NULL; free(A);`
- [ ] `free(A); A[0] = 1;`

The first frees the same block twice. The third writes into memory that is no longer yours. In the second, the pointer is `NULL` before the second `free`, and `free(NULL)` does nothing.
:::
:::

:::problem id=prac-calloc-vs-malloc title="Zero or garbage" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
:::check id=prac-calloc-vs-malloc-q1
Right after `int *A = malloc(3 * sizeof(int));`, the value of `A[0]` is {{=unknown garbage|0|3}}.

`malloc` does not set the bytes. Read them only after you write to them, or use `calloc` if you want zeros.
:::

:::check id=prac-calloc-vs-malloc-q2
After `free(A);`, where `A` came from `calloc`, `A` holds {{=the same old address|NULL|a fresh block's address}}.

`free` returns the memory but never changes your variable. Set `A = NULL;` yourself.
:::
:::

**Next:** [Resizing memory and arrays of strings](topic:realloc-and-strings) grows a block that turned out too small, and uses the heap to store names of different lengths without wasting a byte.
