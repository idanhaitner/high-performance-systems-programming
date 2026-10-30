---
title: Find the first match with a moving pointer
---

Adding 1 to a pointer moves it to the next element, and `NULL` means "points nowhere".

Write `find_first(a, n, target)`. It looks through the `n` `int`s of `a` and returns a **pointer** to the first element equal to `target`. If no element matches, it returns `NULL`.

Use a pointer that walks through the array, instead of an index.

You are done when Test shows all four cases passing.

:::example
**Input:** `find_first(a, 4, 3)`, where `a` is {7, 3, 9, 3}

**Output:** `&a[1]`, the address of the first 3
:::

:::example
**Input:** `find_first(a, 4, 5)`, where `a` is {7, 3, 9, 3}

**Output:** `NULL`
:::

:::hint
Loop with a pointer: `for (int *p = a; p < a + n; p++)`. `a + n` is the spot just past the last element, and inside the loop `*p` is the current element.
:::

:::hint
As soon as `*p == target`, return `p` itself. That is the address of the match, not its value.
:::

:::hint
If the loop ends, nothing matched. Return `NULL` after the loop. With `n` equal to 0, the loop never runs, so this also covers an empty array.
:::

:::case name="match in the middle"
For {7, 3, 9, 3} and target 3, the answer is the address of `a[1]`. If you got `a[3]`, you kept going after the first match: return as soon as you find one.
:::

:::case name="match at the start"
For target 7, the answer is `a` itself, the address of `a[0]`.
:::

:::case name="no match"
Target 5 is not in the array, so the answer must be `NULL`. If you got an address, check what you return after the loop.
:::

:::case name="empty array"
With n = 0 there is nothing to look at, so the answer is `NULL`. Make sure the loop condition is `p < a + n`, so it does not run at all.
:::
