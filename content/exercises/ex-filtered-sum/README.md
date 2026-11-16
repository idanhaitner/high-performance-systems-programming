---
title: Add up only the big values
---

A function that adds into a variable through a pointer, as in `(*count)++`, may make the compiler write to memory on every iteration, because it cannot be sure that the pointer does not point into the array it is reading. A local variable has no such problem.

Write `filtered_sum(a, n, t, count)`. It adds up the numbers of `a` that are greater than `t`, and returns that sum as a `double`. It also stores in `*count` how many numbers were greater than `t`.

Count in a local `int` inside the function, and write it to `*count` only **once**, after the loop.

You are done when Submit shows all three cases passing.

:::example
**Input:** `filtered_sum(a, 5, 2, &count)`, where `a` is {1, 5, 2, 8, 3}

**Output:** 16, and `count` is 3, because 5, 8, and 3 are greater than 2
:::

:::hint
Start with `double sum = 0;` and `int found = 0;`.
:::

:::hint
In the loop, when `a[i] > t`, add `a[i]` to `sum` and add 1 to `found`.
:::

:::hint
After the loop, `*count = found;` and `return sum;`.
:::

:::case name="some values pass"
Only the numbers greater than `t` are added and counted.
:::

:::case name="equal is not greater"
A number equal to `t` is not counted.
:::

:::case name="nothing passes"
When no number is greater than `t`, the sum is 0 and the count is 0, even if `count` held something else before.
:::
