---
title: Fill an array that belongs to the caller
---

A function's local array is destroyed when the function returns, so returning its address is a bug. But the opposite direction is safe. The caller's array stays alive for the whole call, so the caller can pass its address down.

Write `fill_numbers(out, n)`. `out` is the address of an array in the caller, with room for `n` `int`s. Store 10, 20, 30, and so on in its first `n` elements.

You are done when Submit shows all three cases passing.

:::example
**Input:** `int a[3]; fill_numbers(a, 3);`

**Output:** `a` holds `10 20 30`
:::

:::example
**Input:** `int a[1]; fill_numbers(a, 1);`

**Output:** `a` holds `10`
:::

:::hint
`out[i]` reaches element `i` of the caller's array, just as if the array were local.
:::

:::hint
Use a loop from `i = 0` while `i < n`.
:::

:::hint
Element `i` holds `(i + 1) * 10`.
:::

:::case name="three numbers"
The first element is 10, not 0. Count from 1 when you work out the value.
:::

:::case name="one number"
With `n` equal to 1, only one element exists.
:::

:::case name="stays inside n"
Stop after `n` elements. C does not stop you from writing past the end.
:::
