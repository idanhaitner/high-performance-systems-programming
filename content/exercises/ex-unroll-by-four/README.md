---
title: Unroll a loop by four
---

Every pass through a loop pays for an increment, a test, and a jump. Doing four elements in each pass pays that cost once for four elements, and gives the processor four independent pieces of work.

Write `scale(a, b, n)`. The arrays `a` and `b` have `n` numbers each. For every position `i`, set `b[i]` to `a[i] * 3 + 7`.

Use a main loop that handles **four** elements in each pass, with `i` stepping by 4. Then use a second loop for the 0 to 3 elements that are left when `n` is not a multiple of 4. `n` can be 0.

You are done when Submit shows all four cases passing.

:::example
**Input:** `scale(a, b, 5)`, where `a` is {0, 1, 2, 3, 4}

**Output:** `b` is {7, 10, 13, 16, 19}
:::

:::hint
Declare `int i = 0;` before the loops, so the second loop can go on from where the first one stopped.
:::

:::hint
The main loop is `for (; i + 3 < n; i += 4)`. Its test makes sure that `i + 3` is still inside the array.
:::

:::hint
Inside it, write four lines, for `b[i]`, `b[i + 1]`, `b[i + 2]`, and `b[i + 3]`. Then add `for (; i < n; i++) b[i] = a[i] * 3 + 7;`.
:::

:::case name="multiple of four"
With 8 numbers, the main loop does everything.
:::

:::case name="three left over"
With 7 numbers, the main loop does 4 and the second loop does the last 3.
:::

:::case name="fewer than four"
With 3 numbers, the main loop never runs, and the second loop does all of them.
:::

:::case name="nothing past the end"
The function must not write past `b[n - 1]`.
:::
