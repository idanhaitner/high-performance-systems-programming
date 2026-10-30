---
id: stack-or-heap
title: Stack or heap?
sources:
  - "Lecture 2 - Memory management.pptx"
---

You now know two places to keep an array. A **local array**, like `int A[100];` inside a function, lives on the **stack** and disappears by itself when the function ends. A block from `malloc` lives on the **heap** and stays until you `free` it. This last lesson of Lecture 2 compares the two: three reasons to use the heap, three reasons to prefer the stack, and a complete example of a function that builds an array and hands it back.

## Reason 1 for the heap: big arrays

The stack is small. On a typical Linux or macOS machine, the stack of the main part of a program is limited to about 8 MB. The heap can use most of the computer's free memory, often many gigabytes.

```c
int A[10000000];                            /* local: 40 MB on the stack */
```

```c
int *A = malloc(10000000 * sizeof(int));   /* 40 MB on the heap */
```

Ten million `int`s are 40 MB. As a local array, that is five times the usual stack limit. When the program tries to use it, it runs off the end of the stack and the operating system stops it, usually with a segmentation fault. This crash is called a **stack overflow**. The `malloc` version works.

:::definition id=def-stack-overflow title="Stack overflow" source="Lecture 2 - Memory management.pptx"
A stack overflow happens when a program needs more stack memory than its limit, for example for a huge local array or for a function that calls itself too many times. The operating system stops the program.
:::

:::check id=chk-stack-overflow
Inside `main`, which line is likely to crash the program on a typical machine?

- [x] `int big[5000000];`
- [ ] `int *big = malloc(5000000 * sizeof(int));`
- [ ] `int small[100];`

Five million `int`s are 20 MB, more than the usual 8 MB stack, so the local array causes a stack overflow. The same amount from `malloc` comes from the heap, which is much bigger. 100 `int`s are only 400 bytes.
:::

## Reason 2 for the heap: memory that outlives the function

Say you want a function that builds an array and gives it back. This version looks reasonable but is wrong:

```c
int *createArray(int n) {
    int A[n];      /* a local array, on the stack */
    return A;      /* wrong: A is destroyed right now */
}
```

`int A[n];` makes a local array whose length is whatever `n` holds when the function runs. It is still a local variable. When `createArray` returns, its part of the stack is released and will be reused by the next function call. The caller receives a **dangling pointer**: an address of memory that is no longer theirs. Most compilers warn about this ("address of local variable returned").

The heap version is correct, because a heap block is not tied to any function:

```c
int *createArray(int n) {
    int *A = malloc(n * sizeof(int));
    return A;      /* fine: the block stays until someone frees it */
}
```

There is a price: the job of calling `free` now passes to the **caller**. Whoever receives the address must free it, exactly once.

:::check id=chk-who-frees place=text
`createArray` gets a block from `malloc`, keeps its address in `A`, and ends with `return A;`. `main` runs `int *B = createArray(10);`.

Who should call `free`?

- [x] `main`, with `free(B);` once it is done with the array
- [ ] `createArray`, just before `return A;`
- [ ] Nobody: heap memory is freed when the function that made it returns

If `createArray` freed the block before returning, `main` would receive a dangling pointer. Heap memory is never freed by itself, so the job goes to whoever holds the address: here `main`, exactly once.
:::

## Reason 3 for the heap: changing the size

A local array keeps the size it was made with. A heap block can grow or shrink with `realloc`, as in [the last lesson](topic:realloc-and-strings):

```c
int *A = malloc(100 * sizeof(int));
int *bigger = realloc(A, 200 * sizeof(int));
if (bigger != NULL)
    A = bigger;
```

## Why the stack is still a good choice

The heap is not always better. The stack has real advantages:

- **It is faster.** Making a local array only moves one marker (the "top of the stack"). `malloc` has to search for a free block of the right size and keep records about it.
- **It is automatic.** Local memory is released by itself when the function ends. You cannot forget.
- **No leaks.** Because nothing needs a `free`, nothing can leak.

So the rule of thumb is:

| Use the stack (a local array) when | Use the heap (`malloc`) when |
| --- | --- |
| the array is small | the array is large |
| it is needed only while this function runs | it must still exist after the function returns |
| its size never changes | its size may change while the program runs |

:::trap
Returning the address of a local array, or of any local variable. The memory is reused as soon as the function returns. If the array must outlive the function, make it with `malloc` and let the caller `free` it.
:::

## Putting it together: initialize

Here is one last task. Write `int *initialize(int n, int x)`: it receives `n` and `x`, and returns a new array of `n` `int`s filled with `x`, `x + 1`, `x + 2`, and so on.

```c
#include <stdio.h>
#include <stdlib.h>

int *initialize(int n, int x) {
    int *A = malloc(n * sizeof(int));
    if (A == NULL)
        return NULL;
    for (int i = 0; i < n; i++)
        A[i] = x++;          /* store x, then add 1 to x */
    return A;
}

int main(void) {
    int n = 3, x = 10;
    int *A = initialize(n, x);
    if (A == NULL)
        return 1;
    for (int i = 0; i < n; i++)
        printf("%d ", A[i]);   /* 10 11 12 */
    printf("\n");
    free(A);
    A = NULL;
    return 0;
}
```

Line by line:

- The array must outlive `initialize`, so it comes from the heap (reason 2).
- If `malloc` fails, `initialize` passes the `NULL` on to the caller, who checks it.
- `A[i] = x++;` stores the current `x`, then adds 1 to it. `x` is the function's own copy, so the caller's `x` stays 10.
- `main` uses the array and then frees it. `initialize` made the block, but `main` owns it once it receives the address.

## Practice

:::problem id=prac-stack-or-heap title="Where should this array live?" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
:::check id=prac-stack-or-heap-q1
A function makes an array of 1000 `int`s and returns it to its caller. The array must live on {{=the heap, because it must outlive the function|the stack, because 1000 ints is small|either one, because the caller receives its address}}.

Small size is not enough. A local array is destroyed when the function returns, so the caller would get a dangling pointer.
:::

:::check id=prac-stack-or-heap-q2
`main` needs 20 million `int`s for the whole run, and the number never changes. The array should live on {{=the heap, because it is too big for the stack|the stack, because main lasts the whole run|the stack, because its size is fixed}}.

20 million `int`s are 80 MB, far more than the usual 8 MB stack. Lasting long enough and having a fixed size do not help if it does not fit.
:::
:::

:::problem id=prac-dangling-return title="Returning an array" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
:::check id=prac-dangling-return-q1
Which version of `make` hands the caller a usable array?

- [x] `int *A = malloc(n * sizeof(int)); int *B = A; return B;`
- [ ] `int A[n]; return A;`
- [ ] `int *A = malloc(n * sizeof(int)); free(A); return A;`

Returning a copy of the address is fine, because the block is what must survive. The second array is destroyed on return. The third block is given back before the caller gets its address, so both leave a dangling pointer.
:::

:::check id=prac-dangling-return-q2
With a 4-byte `int`, `int *B = initialize(3, 0); B = initialize(3, 1); free(B);` leaks {{=12 bytes|0 bytes|24 bytes}}.

The second line overwrites the only copy of the first block's address, so those 3 `int`s can never be freed. The `free` handles only the second block.
:::
:::

:::problem id=prac-initialize-trace title="Tracing initialize" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
:::check id=prac-initialize-trace-q1
In the array from `initialize(n, x)`, the last element is {{=x + n - 1|x + n|n - 1}}.

The first element is `x`, at index 0, and each next one is 1 more. The last index is `n - 1`. For `initialize(4, -1)` that gives -1, 0, 1, 2.
:::
:::

## Lecture 2 in one paragraph

A pointer can point to another pointer, and `**` follows both arrows; that is how a function changes the caller's pointer. Adding to a pointer moves by whole elements, subtracting two pointers counts elements, and `sizeof` tells an array (its full size) apart from a pointer (8 bytes). A pointer that was never set, or is `NULL`, must not be followed. Functions have addresses too, so a function pointer lets you pass, store, and return functions. `malloc` reserves heap memory while the program runs, `calloc` does the same with zeros, `realloc` resizes it, and `free` returns it, exactly once, at the address `malloc` gave. The heap suits large arrays, arrays that must outlive a function, and arrays that change size; the stack is faster and frees itself.
