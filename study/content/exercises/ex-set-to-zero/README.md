---
title: Set a variable to zero through a pointer
---

A small one, from "Pointers: a variable that holds an address" in the lesson "Memory and pointers": if `p` holds the address of `x`, then writing to `*p` changes `x` itself.

Write `set_to_zero(p)`. After the call, the variable that `p` points to must hold 0. For example:

```c
int x = 42;
set_to_zero(&x);
/* now x is 0 */
```

The starter changes `p` itself, which is only the function's own copy of the address, so `x` stays 42. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
`p` is the address. Which expression is the box at that address?
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
