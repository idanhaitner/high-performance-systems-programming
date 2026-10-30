---
title: Make a heap array of zeros
---

`calloc(n, size)` reserves room for `n` items of `size` bytes each, and fills all of it with zeros.

Write `make_zeros(n)`. It returns a new heap block holding `n` `int`s, all 0. The caller will free it. If there is no memory, `calloc` returns `NULL`, and you just pass that on. Using `malloc` with a loop that stores the zeros is also fine.

You are done when Test shows all three cases passing.

:::hint
With `calloc`, the size of one item is `sizeof(int)`, and you ask for `n` of them.
:::

:::hint
Write `return calloc(n, sizeof(int));`.
:::

:::case name="five zeros"
If you returned `NULL`, nothing was reserved yet. Use `calloc(n, sizeof(int))`.
:::

:::case name="one zero"
It should also work when `n` is 1.
:::

:::case name="separate blocks"
Each call should ask for a new block. Do not keep one block and hand it out twice.
:::
