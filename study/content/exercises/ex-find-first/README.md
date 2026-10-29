---
title: Find the first match with a moving pointer
---

This exercise practices "Four ways to name the same element" and "Subtracting two pointers" from the lesson "Pointer arithmetic and pointer mistakes". Adding 1 to a pointer moves it to the next element, and `NULL` means "points nowhere".

Write `find_first(a, n, target)`. It looks through the `n` `int`s of `a` and returns a **pointer** to the first element equal to `target`. If no element matches, it returns `NULL`. For example:

```c
int a[] = {7, 3, 9, 3};
int *hit = find_first(a, 4, 3);
/* hit == &a[1], so hit - a is 1 */
int *miss = find_first(a, 4, 5);
/* miss == NULL */
```

Use a pointer that walks through the array, instead of an index. It starts at `a` and stops before `a + n`, the spot just past the last element.

The starter always returns `a`, the start of the array, so it finds the wrong element and never says "not found". Press Test first and see which cases fail.

You are done when Test shows all four cases passing.

:::hint
The loop is already there: `p` starts at `a`, and `p++` moves it one `int` forward each time. Inside the loop, `*p` is the current element.
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
