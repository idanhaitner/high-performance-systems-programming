---
title: Call the function you are given
---

A function can receive another function, and call it through a pointer.

Write `apply(f, x)`. It calls the function `f` on the number `x` and returns the answer.

You are done when Test shows all three cases passing.

:::example
**Input:** `apply(twice, 5)`, where `twice` doubles a number

**Output:** `10`
:::

:::example
**Input:** `apply(negate, 4)`, where `negate` changes a number's sign

**Output:** `-4`
:::

:::hint
A function pointer is called just like a normal function, by writing its name and the value in parentheses.
:::

:::hint
Write `return f(x);`.
:::

:::case name="calls twice"
If you got 5, `f` was never called. Return `f(x)`.
:::

:::case name="calls negate"
If you got 4, `f` was never called. Return `f(x)`.
:::

:::case name="calls add_ten"
Call whichever function you were given. Do not write the name of a particular one.
:::
