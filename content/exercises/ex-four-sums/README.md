---
title: Add up an array with four running totals
---

In `sum += a[i]`, every addition waits for the one before, because it needs the new `sum`. Four separate running totals do not wait for each other, so the processor can work on several additions at once.

Write `sum4(a, n)`. It returns the sum of the `n` numbers of `a`. Use four running totals `s0`, `s1`, `s2`, and `s3`, in a main loop that steps by 4: `s0` gets `a[i]`, `s1` gets `a[i + 1]`, `s2` gets `a[i + 2]`, and `s3` gets `a[i + 3]`. After that loop, combine the four totals, and add the 0 to 3 numbers that are left. `n` can be 0.

You are done when Submit shows all four cases passing.

:::example
**Input:** `sum4(a, 8)`, where `a` is {1, 2, 3, 4, 5, 6, 7, 8}

**Output:** 36
:::

:::example
**Input:** `sum4(a, 10)`, where `a` is {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

**Output:** 55, where 9 and 10 are added after the main loop
:::

:::hint
Start with `double s0 = 0, s1 = 0, s2 = 0, s3 = 0;` and `int i = 0;`.
:::

:::hint
The main loop is `for (; i + 3 < n; i += 4)`, with one line for each running total.
:::

:::hint
After it, `double sum = (s0 + s1) + (s2 + s3);`, then `for (; i < n; i++) sum += a[i];`, and return `sum`.
:::

:::case name="multiple of four"
With 8 numbers, the four totals cover everything.
:::

:::case name="numbers left over"
With 10 numbers, the last two are added after the main loop.
:::

:::case name="fewer than four"
With 3 numbers, the main loop never runs.
:::

:::case name="empty array"
The sum of no numbers is 0.
:::
