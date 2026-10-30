---
title: Return a pointer to the last element
---

`a + i` is the address of `a[i]`.

Write `last_element(a, n)`. The array `a` has `n` elements, at least one. The function returns a pointer to the last element. For example, for `int A[4]`, it returns `&A[3]`.

You are done when Test shows all three cases passing.

:::hint
`a + n` is one place **past** the end of the array. Elements are counted from 0, so what is the index of the last of `n` elements?
:::

:::hint
The last index is `n - 1`, so return `a + n - 1`.
:::

:::case name="four elements"
If you are 1 element away, you returned the address one place past the end. Subtract 1.
:::

:::case name="one element"
`a + 1 - 1` is `a` itself, so the same formula works here too.
:::

:::case name="writes reach the array"
Return an address inside the array, not a copy of the value.
:::
