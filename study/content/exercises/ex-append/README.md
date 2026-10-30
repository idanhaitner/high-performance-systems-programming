---
title: Grow an array one element at a time
---

This exercise practices "Growing a block with realloc" from the lesson "Resizing memory and arrays of strings": `realloc` makes a heap block bigger, keeps what was in it, and may move it, so you must use the address it returns.

Write `append(a, n, value)`. `a` is a heap array holding `*n` `int`s. `append` grows the block by **one** `int`, stores `value` in the new last place, adds 1 to `*n`, and returns the array's (possibly new) address. For example:

```c
int *a = NULL;
int n = 0;
a = append(a, &n, 10);
a = append(a, &n, 20);
/* now n is 2, and a holds {10, 20} */
free(a);
```

Two details:

- `n` is passed by address (`&n`), so `append` can change the caller's count, just like `swap` changed the caller's numbers.
- The array may start empty, with `a` equal to `NULL`. That is fine: `realloc(NULL, size)` acts exactly like `malloc(size)`.

The starter does not grow anything yet; it returns `a` unchanged. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
The new size is `*n + 1` elements, which is `(*n + 1) * sizeof(int)` bytes. Ask for that with `realloc(a, ...)` and keep the answer in a new variable, say `bigger`.
:::

:::hint
If `bigger` is `NULL`, the old block is still valid: return `a` and leave `*n` alone. Otherwise the new last place is index `*n`: write `bigger[*n] = value;`.
:::

:::hint
After storing the value, add 1 to the caller's count with `*n = *n + 1;` and return `bigger`. Do not use `a` again: if `realloc` moved the block, `a` was freed.
:::

:::case name="from empty"
Starting from `NULL` and count 0, three appends of 10, 20, 30 should give count 3 and {10, 20, 30}. If the count stayed 0, you never changed `*n`.
:::

:::case name="onto an existing array"
Appending 4 to a heap array {1, 2, 3} should give count 4 and {1, 2, 3, 4}. If the first three changed, you overwrote them: the new value goes at index `*n`, after the old ones.
:::

:::case name="many appends"
After appending 0 to 99, one at a time, the count should be 100 and each element should equal its index. If this crashes, check that you use the address `realloc` returned, not the old one.
:::
