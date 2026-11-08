---
title: Add up every stride-th number
---

A loop with a stride skips over some of the numbers. The bigger the stride, the fewer numbers of each cache line it uses.

Write `sum_every(a, n, stride)`. The array `a` has `n` numbers. The function adds up `a[0]`, `a[stride]`, `a[2 * stride]`, and so on, for every position below `n`. The value `stride` is at least 1.

You are done when Submit shows all three cases passing.

:::example
**Input:** `sum_every(a, 10, 3)`, where `a` is {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

**Output:** 22, because it adds `a[0]`, `a[3]`, `a[6]`, and `a[9]`, which are 1, 4, 7, and 10
:::

:::hint
Use a `for` loop whose step is `stride` instead of 1.
:::

:::hint
The loop is `for (int i = 0; i < n; i += stride)`.
:::

:::hint
Start `sum` at 0, add `a[i]` inside the loop, and return `sum` at the end.
:::

:::case name="stride 1"
A stride of 1 visits every number.
:::

:::case name="stride 3"
With a stride of 3, the positions are 0, 3, 6, and 9.
:::

:::case name="stride bigger than the array"
Only position 0 is below `n`, so the answer is `a[0]`.
:::
