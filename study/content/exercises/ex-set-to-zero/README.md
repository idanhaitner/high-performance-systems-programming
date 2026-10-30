---
title: Set a variable to zero through a pointer
---

If `p` holds the address of `x`, then writing to `*p` changes `x` itself.

Write `set_to_zero(p)`. After the call, the variable that `p` points to must hold 0.

You are done when Test shows all three cases passing.

:::example
**Input:** `int x = 42; set_to_zero(&x);`

**Output:** `x` is 0
:::

:::example
**Input:** `int y = -5; set_to_zero(&y);`

**Output:** `y` is 0
:::

:::hint
`p = 0;` changes only the function's own copy of the address. `p` is the address. Which expression is the box at that address?
:::

:::hint
`*p` is the box. Write `*p = 0;`.
:::

:::case name="positive number"
If `x` is still 42, you changed the pointer and not the box it points to. Write through it with `*p = 0;`.
:::

:::case name="negative number"
If `y` is still -5, you changed the pointer and not the box it points to.
:::

:::case name="only that variable"
Only the variable whose address you received should change.
:::
