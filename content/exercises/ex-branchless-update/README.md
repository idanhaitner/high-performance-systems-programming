---
title: Choose a value instead of a path
---

When a test inside a loop is true or false at random, a jump in the machine code is often guessed wrong. Writing the choice as a choice of **one value**, with a single shared update, lets the compiler pick the value without jumping.

The arrays `a` and `b` hold `n` numbers of type `uint32_t`, a 4-byte whole number with no sign. Write `update(a, b, n)`. For every position `i`, when `a[i]` is greater than `UINT32_MAX / 2`, add `a[i]` to `b[i]`. Otherwise, subtract `a[i]` from `b[i]`.

Write it with a single statement in the loop: `b[i] +=` a value chosen with `? :`. For unsigned numbers, adding `-a[i]` is the same as subtracting `a[i]`, because both wrap around the same way.

You are done when Submit shows all three cases passing.

:::example
**Input:** `a` is {10, 4000000000}, `b` is {50, 5}

**Output:** `b` is {40, 4000000005}, because 10 is small, so it is subtracted, and 4,000,000,000 is big, so it is added
:::

:::hint
`UINT32_MAX` is the biggest `uint32_t`, 4,294,967,295. Half of it is about 2.1 billion.
:::

:::hint
`test ? first : second` gives `first` when the test is true and `second` otherwise.
:::

:::hint
The loop body is `b[i] += (a[i] > UINT32_MAX / 2) ? a[i] : -a[i];`.
:::

:::case name="small values are subtracted"
A value in the lower half of the range is taken away from `b[i]`.
:::

:::case name="big values are added"
A value in the upper half of the range is added to `b[i]`.
:::

:::case name="subtracting wraps around"
1 minus 5 with unsigned numbers wraps around to 4,294,967,292.
:::
