---
title: Keep a value alive after the function ends
---

A local variable is destroyed when its function returns, and a heap block stays until you free it.

Write `make_box(value)`. It returns the address of an `int` holding `value`, and that `int` must still be there after `make_box` returns. The caller frees it. If there is no memory, return `NULL`.

The starter returns the address of a local variable. That box no longer exists once the function has returned, so the address is a **dangling pointer**: it points at memory the program no longer owns. The compiler even warns you about it. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
Which function reserves memory that stays until you free it? You need room for one `int`.
:::

:::hint
Write `int *box = malloc(sizeof(int));`, and return `NULL` if `box` is `NULL`.
:::

:::hint
Then store the value with `*box = value;`, and return `box`.
:::

:::case name="keeps the value"
If you still return the address of a local variable, it is not valid after the function returns. Use `malloc`.
:::

:::case name="two separate boxes"
If both calls return the same address, you are still returning the address of a local variable. Each call needs its own heap block.
:::

:::case name="a negative value"
Store exactly the value you received, and make a new block on every call.
:::
