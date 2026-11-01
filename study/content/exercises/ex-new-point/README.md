---
title: Make a structure on the heap
---

A structure made inside a function disappears when the function returns. One from `malloc` stays until it is freed.

Write `new_point(x, y)`. It reserves one `Point` on the heap, stores `x` and `y` in it, and returns its address. The caller frees it. If there is no memory, return `NULL`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `Point *p = new_point(10, 20);`

**Output:** `p->x` is 10 and `p->y` is 20
:::

:::hint
Ask for the size of one whole structure with `malloc(sizeof(Point))`.
:::

:::hint
`p` is a pointer, so reach the members with an arrow: `p->x = x;`.
:::

:::hint
Check for `NULL` before you use `p`, and end with `return p;`.
:::

:::case name="keeps both values"
Store both members, and return the address of a heap block rather than a local variable.
:::

:::case name="a second point"
Each call needs a new block of its own.
:::

:::case name="the first point stays"
If the first point changed, both calls are using the same memory.
:::
